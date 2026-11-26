import {ChangeDetectionStrategy, Component, forwardRef, input, Type} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgSelectComponent} from '@ng-select/ng-select';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {HelpContentService} from '../../../services/help-content.service';
import {ProviderService} from '../../../services/provider.service';
import {ResourceService} from '../../../services/resource.service';
import {UserSessionService} from '../../../services/user-session.service';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {UpdateServiceProviderComponent} from './update-service-provider.component';

// OnPush like AppComponent, so a check refreshes the form only when it read a changed signal or marked itself for check.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class AppHostComponent {}

// ng-select ships prebuilt and loads a second copy of Angular core under Vitest; this stands in for it.
@Component({
  selector: 'ng-select',
  template: '',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgSelectStubComponent), multi: true}]
})
class NgSelectStubComponent implements ControlValueAccessor {
  readonly items = input<unknown[]>();
  writeValue() { /* not needed */ }
  registerOnChange() { /* not needed */ }
  registerOnTouched() { /* not needed */ }
}

// Every vocabulary type the form asks for, empty.
const noVocabularies = () => new Proxy({}, {get: () => []});

const provider = () => ({
  id: 'openaire', name: 'OpenAIRE', abbreviation: 'OA', website: 'https://www.openaire.eu', description: 'Open science',
  logo: 'https://www.openaire.eu/logo.png', tags: ['open-science', 'graph'],
  location: {streetNameAndNumber: 'Artemidos 6', postalCode: '15125', city: 'Athens', country: 'GR'},
  mainContact: {firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.org'},
  users: [{name: 'Ada', surname: 'Lovelace', email: 'ada@example.org'}]
});

describe('provider forms', () => {
  let vocabularies: Subject<unknown>;
  let providers: Subject<unknown>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vocabularies = new Subject();
    providers = new Subject();
    create = vi.fn(() => new Subject());
    update = vi.fn(() => throwError(() => ({status: 400, error: {message: 'Name taken', transactionId: 't1'}})));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: 'provider/add', component: ServiceProviderFormComponent},
          {path: 'provider/:providerId/update', component: UpdateServiceProviderComponent}
        ]),
        {provide: ResourceService, useValue: {getAllVocabulariesByType: () => vocabularies}},
        {provide: ProviderService, useValue: {getProviderById: () => providers, createNewServiceProvider: create, updateServiceProvider: update}},
        {provide: UserSessionService, useValue: {isSignedIn: () => true, login: vi.fn()}},
        {provide: HelpContentService, useValue: {getActivePageContent: () => of({content: {}})}}
      ]
    });
    for (const form of [ServiceProviderFormComponent, UpdateServiceProviderComponent] as Type<unknown>[]) {
      TestBed.overrideComponent(form, {remove: {imports: [NgSelectComponent]}, add: {imports: [NgSelectStubComponent]}});
    }
  });

  const open = async (url: string) => {
    const fixture = TestBed.createComponent(AppHostComponent);
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const answer = (subject: Subject<unknown>, value: unknown) => {
      subject.next(value);
      subject.complete();
      fixture.detectChanges();
    };
    const text = () => root.textContent!.replace(/\s+/g, ' ');
    const name = () => root.querySelector<HTMLInputElement>('input#providerName');
    return {fixture, root, answer, text, name};
  };

  describe('ServiceProviderFormComponent', () => {
    it('shows the form once the vocabularies have loaded', async () => {
      const {answer, name} = await open('/provider/add');
      expect(name()).toBeNull();

      answer(vocabularies, noVocabularies());

      expect(name()).not.toBeNull();
    });

    // uk-tab switches the panel only when the clicked tab is not marked active yet, so the template must not mark it.
    it('leaves the active tab to UIkit', async () => {
      const {fixture, root, answer} = await open('/provider/add');
      answer(vocabularies, noVocabularies());
      const tabs = [...root.querySelectorAll('ul.form-tabs > li')];
      // In the app zone.js checks the view after each listener: after Angular's on the link, before UIkit's on the list.
      // The tab is read right after that check, on its way up to the list: specs share one window
      // (isolate is off), so a spec that loads UIkit would leave it running here, and on the list it would mark the tab itself.
      let activeWhenUIkitRuns: boolean | undefined;
      tabs[2].addEventListener('click', event => {
        event.preventDefault();
        fixture.detectChanges();
        activeWhenUIkitRuns = tabs[2].classList.contains('uk-active');
      });

      tabs[2].querySelector('a')!.click();

      expect(activeWhenUIkitRuns).toBe(false);
    });

    it('marks the missing fields and their tab when submitted empty', async () => {
      const {fixture, root, answer, text, name} = await open('/provider/add');
      answer(vocabularies, noVocabularies());
      vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      const marked = () => [...root.querySelectorAll('ul.form-tabs .form-error')];
      expect(marked()).toEqual([]);

      [...root.querySelectorAll('button')].find(button => button.textContent!.trim() === 'Submit')!.click();
      fixture.detectChanges();

      expect(text()).toContain('Please fill in all required fields');
      expect(name()!.classList).toContain('uk-form-danger');
      expect(root.querySelector('#top-navigation-tabs')).not.toBeNull();
      // Only the links of the tabs with a missing field are marked, never every tab's item.
      expect(marked().every(element => element.tagName === 'A')).toBe(true);
      const tabs = marked().map(a => a.textContent!.trim());
      expect(tabs[0]).toContain('Basic');
      expect(tabs).not.toContain('3. Classification');
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('UpdateServiceProviderComponent', () => {
    it('fills the form with the provider once it arrives, with an input for every tag', async () => {
      const {root, answer, text, name} = await open('/provider/openaire/update');
      answer(vocabularies, noVocabularies());
      expect(text()).toContain('Provider Name');

      answer(providers, provider());

      expect(text()).toContain('OpenAIRE');
      expect(text()).not.toContain('Provider Name');
      expect(name()!.value).toBe('OpenAIRE');
      expect([...root.querySelectorAll<HTMLInputElement>('input#tags')].map(tag => tag.value)).toEqual(['open-science', 'graph']);
    });

    it('says so when the provider fails to load', async () => {
      const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const {fixture, text} = await open('/provider/openaire/update');
      vocabularies.next(noVocabularies());
      providers.error({status: 500});
      fixture.detectChanges();

      expect(text()).toContain('Something went wrong.');
      quiet.mockRestore();
    });

    // An update replaces the stored provider, so a field the form leaves out is deleted.
    it('sends back the alternative identifiers of the provider', async () => {
      const {fixture, root, answer} = await open('/provider/openaire/update');
      answer(vocabularies, noVocabularies());
      const alternativeIdentifiers = [{type: 'PID', value: '21.T15999/oa'}, {type: 'ROR', value: 'https://ror.org/0abc'}];
      answer(providers, {...provider(), publicContacts: [{email: 'info@example.org'}], alternativeIdentifiers});
      vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      expect(root.querySelector<HTMLInputElement>('#alternativeIdentifierValue1')!.value).toBe('https://ror.org/0abc');

      [...root.querySelectorAll('button')].find(button => button.textContent!.trim() === 'Submit')!.click();
      fixture.detectChanges();

      expect(update).toHaveBeenCalledWith(expect.objectContaining({alternativeIdentifiers}), 'openaire');
    });

    it("shows the server's message and error code when the update fails", async () => {
      const {fixture, root, answer, text} = await open('/provider/openaire/update');
      answer(vocabularies, noVocabularies());
      answer(providers, {...provider(), publicContacts: [{email: 'info@example.org'}]});
      vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

      [...root.querySelectorAll('button')].find(button => button.textContent!.trim() === 'Submit')!.click();
      fixture.detectChanges();

      expect(update).toHaveBeenCalled();
      expect(text()).toContain('Name taken');
      expect(text()).toContain('Error Code: t1');
      expect(text()).not.toContain('undefined');
    });
  });
});
