import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {HttpErrorResponse, provideHttpClient} from '@angular/common/http';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Field, Model, Section} from '../../../catalogue-ui/domain/dynamic-form-model';
import {FormControlService} from '../../../catalogue-ui/services/form-control.service';
import {ResourceService} from '../../services/resource.service';
import {ProviderService} from '../../services/provider.service';
import {Vocabulary} from '../../entities/eic-model';
import {FormsComponent} from './forms.component';

// OnPush like AppComponent, so a check refreshes the page only when it read a changed signal or marked itself for check.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class AppHostComponent {}

const field = (id: string, name: string, type: string, subFields: Field[] | null = null, multiplicity = false, mandatory = false): Field => {
  const result = new Field();
  Object.assign(result, {id, name, accessPath: name, subFields});
  result.label.text = name;
  result.typeInfo.type = type;
  result.typeInfo.multiplicity = multiplicity;
  result.form.mandatory = mandatory;
  return result;
};

// The service form model, cut down to a name and the two lists the page tidies before saving.
const model = (): Model => Object.assign({} as Model, {
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

// The provider form model, cut down to a name and two optional lists whose rows have a required field.
const providerModel = (): Model => Object.assign({} as Model, {
  name: 'OpenAIRE provider', resourceType: 'provider',
  sections: [Object.assign(new Section(), {
    id: 'provider', name: 'provider', order: 0, fields: null, subSections: [
      Object.assign(new Section(), {id: 'basic', name: 'Basic', order: 0, subSections: null, fields: [
        field('1', 'name', 'string', null, false, true),
        field('2', 'multimedia', 'composite', [field('3', 'multimediaURL', 'url', null, false, true)], true),
        field('4', 'alternativeIdentifiers', 'composite', [field('5', 'type', 'string'), field('6', 'value', 'string')], true)
      ]})
    ]
  })]
});

describe('FormsComponent', () => {
  let services: Subject<unknown>;
  let resources: Record<string, ReturnType<typeof vi.fn>>;
  let providers: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    services = new Subject();
    resources = {
      getService: vi.fn(() => services),
      // Every vocabulary type the page sorts, empty.
      getUiVocabularies: vi.fn(() => of(new Proxy({}, {get: () => []}))),
      editService: vi.fn(() => throwError(() => ({error: {message: 'Name taken', transactionId: 't1'}})))
    };
    providers = {
      getProviderById: vi.fn(() => of({id: 'openaire', name: 'OpenAIRE', alternativeIdentifiers: [{type: 'PID', value: '21.T15999/oa'}]})),
      updateServiceProvider: vi.fn(() => of({id: 'openaire'})),
      createNewServiceProvider: vi.fn(() => of({id: 'new-provider'})),
      createNewServiceProviderWithToken: vi.fn(() => of({id: 'invited-provider'}))
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([
          {path: 'service/edit/:resourceId', component: FormsComponent},
          {path: 'provider/add', component: FormsComponent},
          {path: 'provider/:providerId/update', component: FormsComponent},
          {path: 'provider/:providerId/service/add', component: FormsComponent},
          {path: 'provider/:providerId/dashboard/home', children: []}
        ]),
        {provide: ResourceService, useValue: resources},
        {provide: ProviderService, useValue: providers}
      ]
    });
    const models: Record<string, () => Model> = {service: model, provider: providerModel};
    TestBed.overrideComponent(FormsComponent, {
      set: {providers: [{provide: FormControlService, useValue: {getFormModelByResourceType: (type: string) => of({results: [models[type]()]})}}]}
    });
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    sessionStorage.clear();
  });

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
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
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

  describe('for a provider', () => {
    const submit = async (page: Awaited<ReturnType<typeof open>>) => {
      [...page.root.querySelectorAll('button')].find(button => button.textContent!.trim() === 'Submit')!.click();
      await page.settle();
    };
    const typeName = (page: Awaited<ReturnType<typeof open>>, value: string) => {
      page.name()!.value = value;
      page.name()!.dispatchEvent(new Event('input'));
    };

    it('edits the provider of the route, sending it back whole but without the rows left empty, then opens its dashboard', async () => {
      const page = await open('/provider/openaire/update');
      await page.settle();
      expect(providers['getProviderById']).toHaveBeenCalledWith('openaire');
      expect(page.name()!.value).toBe('OpenAIRE');

      await submit(page);

      // The form's empty Multimedia row is not sent: the stored provider had none.
      expect(providers['updateServiceProvider']).toHaveBeenCalledWith(
        {name: 'OpenAIRE', alternativeIdentifiers: [{type: 'PID', value: '21.T15999/oa'}]}, 'openaire');
      expect(TestBed.inject(Router).url).toBe('/provider/openaire/dashboard/home');
    });

    it('registers a new provider and opens the dashboard of the id the server gave it', async () => {
      const page = await open('/provider/add');
      await page.settle();
      expect(providers['getProviderById']).not.toHaveBeenCalled();
      typeName(page, 'Argos Lab');

      await submit(page);

      expect(providers['createNewServiceProvider']).toHaveBeenCalledWith({name: 'Argos Lab'});
      expect(TestBed.inject(Router).url).toBe('/provider/new-provider/dashboard/home');
    });

    it('registers it with the invitation the join page kept, once', async () => {
      sessionStorage.setItem('token', 'invitation-1');
      const page = await open('/provider/add');
      await page.settle();
      typeName(page, 'Argos Lab');

      await submit(page);

      expect(providers['createNewServiceProviderWithToken']).toHaveBeenCalledWith({name: 'Argos Lab'}, 'invitation-1');
      expect(providers['createNewServiceProvider']).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(TestBed.inject(Router).url).toBe('/provider/invited-provider/dashboard/home');
    });

    it('keeps the invitation when the registration fails, for the next try', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      providers['createNewServiceProviderWithToken'].mockReturnValueOnce(throwError(() => new HttpErrorResponse({status: 403, error: {message: 'Invitation expired'}})));
      sessionStorage.setItem('token', 'invitation-1');
      const page = await open('/provider/add');
      await page.settle();
      typeName(page, 'Argos Lab');

      await submit(page);

      expect(page.root.textContent).toContain('Invitation expired');
      expect(sessionStorage.getItem('token')).toBe('invitation-1');
      vi.restoreAllMocks();
    });

    it('lists the MERIL subdomains by their domain, like the scientific ones', async () => {
      const page = await open('/provider/add');
      await page.settle();
      const component = page.fixture.debugElement.query(debug => debug.componentInstance instanceof FormsComponent).componentInstance as FormsComponent;
      const vocabulary = (id: string, parentId: string) => ({id, name: id, parentId}) as Vocabulary;
      const all = new Proxy({
        'Scientific subdomain': [vocabulary('sd-1', 'd-1')],
        'Provider meril scientific subdomain': [vocabulary('meril-1-b', 'meril-1'), vocabulary('meril-1-a', 'meril-1'), vocabulary('meril-2-a', 'meril-2')]
      } as Record<string, Vocabulary[]>, {get: (target, type: string) => target[type] ?? []});

      const subVocabularies = component.prepareVocabularies(all) as Record<string, Vocabulary[]>;

      expect(subVocabularies['meril-1'].map(v => v.id)).toEqual(['meril-1-a', 'meril-1-b']);
      expect(subVocabularies['meril-2'].map(v => v.id)).toEqual(['meril-2-a']);
      expect(subVocabularies['d-1'].map(v => v.id)).toEqual(['sd-1']);
    });
  });

  describe('when saving fails', () => {
    const failedSave = async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      const page = await open('/service/edit/argos');
      services.next({id: 'argos', name: 'Argos'});
      services.complete();
      await page.settle();
      const submit = async () => {
        [...page.root.querySelectorAll('button')].find(button => button.textContent!.trim() === 'Submit')!.click();
        await page.settle();
      };
      const error = () => page.root.querySelector<HTMLElement>('#formErrorAlert');
      return {...page, submit, error};
    };

    afterEach(() => vi.restoreAllMocks());

    it('moves the focus to the error, and shows the next error once the user closed this one', async () => {
      const {settle, submit, error} = await failedSave();

      await submit();
      expect(document.activeElement).toBe(error());
      expect(error()!.querySelector('button.uk-alert-close')!.getAttribute('aria-label')).toBe('Close');

      // UIkit fades the alert out from its close button, then fires hidden.
      error()!.dispatchEvent(new CustomEvent('hidden'));
      await settle();
      expect(error()).toBeNull();

      resources['editService'].mockReturnValueOnce(throwError(() => new HttpErrorResponse({status: 0, statusText: 'Unknown Error'})));
      await submit();
      expect(error()!.textContent).toContain('The server could not be reached.');
      expect(document.activeElement).toBe(error());
    });

    it('says what failed when the server sends no message', async () => {
      const {submit, error} = await failedSave();
      resources['editService'].mockReturnValueOnce(throwError(() => new HttpErrorResponse({status: 502, statusText: 'Bad Gateway', error: null})));

      await submit();

      expect(error()!.textContent!.trim()).toBe('Saving failed: the server answered 502 Bad Gateway.');
    });
  });
});
