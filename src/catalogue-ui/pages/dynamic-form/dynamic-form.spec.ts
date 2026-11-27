import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {FormArray, FormControl, FormGroup, TouchedChangeEvent} from '@angular/forms';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {Dependent, Field, Model, Section, SurveyPayload} from '../../domain/dynamic-form-model';
import {controlTreeEvents} from '../../shared/form-refresh';
import {ReadMoreTextComponent} from '../../shared/reusable-components/read-more.component';
import {SurveyComponent} from './survey.component';

interface FieldOptions {
  mandatory?: boolean;
  multiplicity?: boolean;
  values?: string[];
  dependsOn?: {name: string; value: string};
  subFields?: Field[];
}

const field = (id: string, name: string, type: string, options: FieldOptions = {}): Field => {
  const result = new Field();
  result.id = id;
  result.name = name;
  result.accessPath = name;
  result.label.text = name;
  result.typeInfo.type = type;
  result.typeInfo.multiplicity = !!options.multiplicity;
  result.typeInfo.values = options.values ?? [];
  result.form.mandatory = !!options.mandatory;
  result.form.dependsOn = options.dependsOn ? {...options.dependsOn} as Dependent : null;
  result.subFields = options.subFields ?? null;
  return result;
};

const group = (id: string, name: string, order: number, fields: Field[]): Section =>
  Object.assign(new Section(), {id, name, order, fields, subSections: null});

// A service form like the real one: one section named after the resource, its tabs as sub-sections.
const model = (): Model => Object.assign({} as Model, {
  name: 'Service form',
  resourceType: 'service',
  sections: [Object.assign(new Section(), {
    id: 'service', name: 'service', order: 1, fields: null, subSections: [
      group('basics', 'Basics', 1, [
        Object.assign(field('1', 'name', 'string', {mandatory: true}), {label: Object.assign(field('1', 'name', 'string').label, {style: 'color: rgb(200, 0, 0)'})}),
        field('2', 'tags', 'string', {multiplicity: true}),
        field('3', 'paid', 'radio', {values: ['true', 'false']}),
        field('4', 'priceNote', 'largeText', {dependsOn: {name: 'paid', value: 'true'}}),
        field('7', 'summary', 'largeText', {values: ['100']})
      ]),
      group('contact', 'Contact', 2, [
        field('5', 'contact', 'composite', {subFields: [field('6', 'email', 'email', {mandatory: true})]}),
        field('8', 'lastUpdate', 'date')
      ])
    ]
  })]
});

// OnPush like FormsComponent, the page that hosts the survey.
@Component({
  imports: [SurveyComponent],
  template: '<app-survey [payload]="payload()" [model]="model()" />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FormPageComponent {
  readonly payload = signal<SurveyPayload | null>(null);
  readonly model = signal<Model | null>(null);
}

@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class AppHostComponent {}

describe('dynamic form', () => {
  const open = async (payload: SurveyPayload | null) => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{path: 'service/edit/:resourceId', component: FormPageComponent}])]
    });
    const fixture = TestBed.createComponent(AppHostComponent);
    await TestBed.inject(Router).navigateByUrl('/service/edit/argos');
    fixture.detectChanges();
    const page = fixture.debugElement.query(debug => debug.componentInstance instanceof FormPageComponent).componentInstance as FormPageComponent;
    page.payload.set(payload);
    page.model.set(model());
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const survey = fixture.debugElement.query(debug => debug.componentInstance instanceof SurveyComponent).componentInstance as SurveyComponent;
    const input = (id: string) => root.querySelector<HTMLInputElement>(`input[id="${id}"]`)!;
    const formOf = (element: Element) => element.closest('form')!;
    return {fixture, root, survey, input, formOf};
  };

  it('shows the saved answers, with the invalid ones marked', async () => {
    const {root, input} = await open({answer: {service: {name: 'Argos', tags: ['a', 'b'], paid: 'false', contact: {email: 'not an email'}}}});

    expect(input('1').value).toBe('Argos');
    expect(input('1').classList).not.toContain('uk-form-danger');
    expect([...root.querySelectorAll<HTMLInputElement>('input[id="tags"]')].map(tag => tag.value)).toEqual(['a', 'b']);
    expect(input('6').value).toBe('not an email');
    expect(input('6').classList).toContain('uk-form-danger');
  });

  it('applies the label style the model gives', async () => {
    const {root} = await open(null);
    expect(root.querySelector<HTMLElement>('.uk-form-label[for="name"]')!.style.color).toBe('rgb(200, 0, 0)');
  });

  it('shows the field that depends on another once the user picks the value it needs', async () => {
    const {fixture, root, formOf} = await open({answer: {service: {name: 'Argos', paid: 'false'}}});
    const note = root.querySelector<HTMLTextAreaElement>('textarea[id="priceNote"]')!;
    expect(formOf(note).classList).toContain('uk-hidden');
    expect(note.disabled).toBe(true);

    [...root.querySelectorAll('label')].find(label => label.textContent!.trim() === 'true')!.querySelector('input')!.click();
    fixture.detectChanges();

    expect(formOf(note).classList).not.toContain('uk-hidden');
    expect(note.disabled).toBe(false);
  });

  it('marks the empty required fields when the whole form is marked touched', async () => {
    const {fixture, survey, input} = await open(null);
    expect(input('1').classList).not.toContain('uk-form-danger');
    expect(input('6').classList).not.toContain('uk-form-danger');

    survey.form.markAllAsTouched();
    fixture.detectChanges();

    expect(input('1').classList).toContain('uk-form-danger');
    expect(input('6').classList).toContain('uk-form-danger');
  });

  it('counts the characters of a value set from outside the field', async () => {
    const {fixture, root, survey} = await open(null);
    const counter = () => root.querySelector('textarea[id="summary"]')!.parentElement!.textContent!.replace(/\s+/g, ' ');
    expect(counter()).toContain(' 0/ 100');

    // Only the value changes: the control stays valid, untouched and pristine.
    survey.form.get('service.summary')!.setValue('Plan your data');
    fixture.detectChanges();

    expect(counter()).toContain(' 14/ 100');
  });

  it('adds an input when the user adds a tag', async () => {
    const {fixture, root} = await open(null);
    const tags = () => root.querySelectorAll('input[id="tags"]').length;
    expect(tags()).toBe(1);

    [...root.querySelectorAll<HTMLAnchorElement>('a.add-new-element')].find(a => a.textContent!.includes('tags'))!.click();
    fixture.detectChanges();

    expect(tags()).toBe(2);
  });

  it('submits the chapter once from its Submit button, without the DOM event leaving the chapter', async () => {
    const {root, survey, input} = await open(null);
    const submitted: unknown[] = [];
    survey.submit.subscribe(value => submitted.push(value));
    const bubbled = vi.fn();
    root.addEventListener('submit', bubbled);

    const submit = [...root.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent!.trim() === 'Submit')!;
    expect(submit.form!.contains(input('1'))).toBe(true);
    submit.click();

    expect(submitted).toEqual([[survey.form, false]]);
    expect(bubbled).not.toHaveBeenCalled();
  });

  it('saves through the page from the unsaved-changes prompt, as the Submit button does', async () => {
    const {root, survey} = await open(null);
    const submitted: unknown[] = [];
    survey.submit.subscribe(value => submitted.push(value));

    const submitNow = [...root.querySelectorAll<HTMLButtonElement>('#unsaved-changes-modal button')].find(button => button.textContent!.trim() === 'Submit now')!;
    expect(submitNow.classList).toContain('uk-modal-close');
    submitNow.click();

    expect(submitted).toEqual([[survey.form, false]]);
    // The page saves the resource; the survey sends nothing of its own.
    TestBed.inject(HttpTestingController).verify();
  });

  it('keeps Enter in the date field from submitting the chapter, which the field has no inner form to stop', async () => {
    const {root, survey} = await open(null);
    const submitted = vi.fn();
    survey.submit.subscribe(submitted);
    const date = root.querySelector<HTMLInputElement>('dp-date-picker[id="lastUpdate"] input')!;
    expect(date.form!.id).toBe('chapter-form-service');

    const enter = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
    date.dispatchEvent(enter);

    expect(enter.defaultPrevented).toBe(true);
    expect(submitted).not.toHaveBeenCalled();
  });

  describe('when validation finds missing fields', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('moves the focus to the error, which closes from a named button', async () => {
      vi.stubGlobal('UIkit', {modal: () => ({hide: vi.fn()})});
      const {fixture, root, survey} = await open(null);

      survey.validateForm();
      fixture.detectChanges();
      await fixture.whenStable();

      const error = root.querySelector<HTMLElement>('#errorAlert')!;
      expect(error.textContent).toContain('There are missing fields at chapters');
      expect(document.activeElement).toBe(error);
      expect(error.querySelector('button.uk-alert-close')!.getAttribute('aria-label')).toBe('Close');

      // UIkit fades the alert out from its close button, then fires hidden: the message goes with it.
      error.dispatchEvent(new CustomEvent('hidden'));
      fixture.detectChanges();
      expect(survey.errorMessage()).toBe('');
      expect(root.querySelector('#errorAlert')).toBeNull();
    });
  });
});

describe('controlTreeEvents', () => {
  it('tells about the controls under a group, including ones added later and not ones removed', () => {
    const email = new FormControl('');
    const phones = new FormArray([new FormControl('')]);
    const contact = new FormGroup({email, phones});
    const events: unknown[] = [];
    const subscription = controlTreeEvents(contact).subscribe(event => events.push(event));

    contact.markAllAsTouched();
    expect(events.filter(event => event instanceof TouchedChangeEvent).map(event => (event as TouchedChangeEvent).source))
      .toEqual([contact, email, phones, phones.at(0)]);

    const added = new FormControl('');
    phones.push(added);
    const removed = phones.at(0);
    phones.removeAt(0);
    events.length = 0;
    added.markAsTouched({onlySelf: true});
    removed.markAsTouched({onlySelf: true});
    expect(events.map(event => (event as TouchedChangeEvent).source)).toEqual([added]);
    subscription.unsubscribe();
  });
});

describe('ReadMoreTextComponent', () => {
  afterEach(() => vi.useRealTimers());

  // Eager, so every fixture check reaches the child, which (OnPush) refreshes only on its own triggers.
  @Component({
    imports: [ReadMoreTextComponent],
    template: '<read-more-text [maxHeight]="46" text="A long description" />',
    // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- Eager on purpose, see above
    changeDetection: ChangeDetectionStrategy.Eager
  })
  class HostComponent {}

  it('collapses the text once it has measured it, and expands it on click', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).not.toContain('View more');

    // jsdom has no layout, so the text measures 0 high, which also counts as too high.
    vi.advanceTimersByTime(200);
    fixture.detectChanges();
    expect(root.textContent).toContain('View more...');
    expect(root.querySelector('div')!.classList).toContain('collapsed');

    root.querySelector('a')!.click();
    fixture.detectChanges();
    expect(root.textContent).toContain('View less...');
    expect(root.querySelector('div')!.classList).not.toContain('collapsed');
  });
});
