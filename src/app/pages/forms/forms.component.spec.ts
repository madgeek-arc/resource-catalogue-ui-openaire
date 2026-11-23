import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Field, Model, Section} from '../../../catalogue-ui/domain/dynamic-form-model';
import {FormControlService} from '../../../catalogue-ui/services/form-control.service';
import {ResourceService} from '../../services/resource.service';
import {FormsComponent} from './forms.component';

// OnPush like AppComponent, so a check refreshes the page only when it read a changed signal or marked itself for check.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class AppHostComponent {}

const field = (id: string, name: string, type: string, subFields: Field[] = null, multiplicity = false): Field => {
  const result = new Field();
  Object.assign(result, {id, name, accessPath: name, subFields});
  result.label.text = name;
  result.typeInfo.type = type;
  result.typeInfo.multiplicity = multiplicity;
  return result;
};

// The service form model, cut down to a name and the two lists the page tidies before saving.
const model = (): Model => Object.assign(new Model(), {
  name: 'Service form', resourceType: 'service',
  sections: [Object.assign(new Section(), {
    id: 'service', name: 'service', order: 1, fields: null, subSections: [
      Object.assign(new Section(), {id: 'basics', name: 'Basics', order: 1, subSections: null, fields: [
        field('1', 'name', 'string'),
        field('2', 'multimedia', 'composite', [field('3', 'multimediaURL', 'string')], true),
        field('4', 'useCases', 'composite', [field('5', 'useCaseURL', 'string')], true)
      ]})
    ]
  })]
});

describe('FormsComponent', () => {
  let services: Subject<unknown>;
  let resources: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    services = new Subject();
    resources = {
      getService: vi.fn(() => services),
      // Every vocabulary type the page sorts, empty.
      getUiVocabularies: vi.fn(() => of(new Proxy({}, {get: () => []}))),
      editService: vi.fn(() => throwError(() => ({error: {message: 'Name taken', transactionId: 't1'}})))
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([
          {path: 'service/edit/:resourceId', component: FormsComponent},
          {path: 'provider/:providerId/service/add', component: FormsComponent}
        ]),
        {provide: ResourceService, useValue: resources}
      ]
    });
    TestBed.overrideComponent(FormsComponent, {
      set: {providers: [{provide: FormControlService, useValue: {getFormModelByResourceType: () => of({results: [model()]})}}]}
    });
  });

  afterEach(() => window.history.replaceState(null, '', '/'));

  const open = async (url: string) => {
    window.history.replaceState(null, '', url);
    const fixture = TestBed.createComponent(AppHostComponent);
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const name = () => root.querySelector<HTMLInputElement>('input[id="1"]');
    const loader = () => root.querySelector('.whiteFilm .loader');
    return {fixture, root, settle, name, loader};
  };

  it('loads the service and its form, then shows the form filled in', async () => {
    const {settle, name, loader} = await open('/service/edit/argos');
    expect(resources['getService']).toHaveBeenCalledWith('argos');
    expect(loader()).not.toBeNull();
    expect(name()).toBeNull();

    services.next({id: 'argos', name: 'Argos'});
    services.complete();
    await settle();

    expect(loader()).toBeNull();
    expect(name()!.value).toBe('Argos');
  });

  it('opens an empty form for a new service', async () => {
    const {settle, name, loader} = await open('/provider/openaire/service/add');
    await settle();

    expect(resources['getService']).not.toHaveBeenCalled();
    expect(loader()).toBeNull();
    expect(name()!.value).toBe('');
  });

  it('shows what the server said and hides the loader when saving fails', async () => {
    const quiet = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const {root, settle, loader} = await open('/service/edit/argos');
    services.next({id: 'argos', name: 'Argos'});
    services.complete();
    await settle();

    [...root.querySelectorAll('button')].find(button => button.textContent!.trim() === 'Submit')!.click();
    await settle();

    expect(resources['editService']).toHaveBeenCalledWith(expect.objectContaining({name: 'Argos', multimedia: null, useCases: null}));
    expect(root.textContent).toContain('Name taken');
    expect(root.textContent).toContain('Error Code: t1');
    expect(loader()).toBeNull();
    quiet.mockRestore();
  });
});
