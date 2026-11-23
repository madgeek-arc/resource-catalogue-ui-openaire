import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {UserInfo} from '../../../entities/userInfo';
import {ResourceService} from '../../../services/resource.service';
import {UserSessionService} from '../../../services/user-session.service';
import {MiscellaneousComponent} from './miscellaneous/miscellaneous.component';
import {OverviewComponent} from './overview/overview.component';
import {ServiceLandingPageComponent} from './service-landing-page.component';

// OnPush like AppComponent, so a check refreshes the landing page only when it read a changed signal or marked itself for check.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class AppHostComponent {}

const makeService = (id: string, tagline: string, relatedResources: string[] = []) => ({
  id, tagline, relatedResources, webpage: 'https://example.org',
  termsOfUse: 'https://example.org/terms',
  extras: {name: id, openAireChangeLog: ['older', 'newer'], paymentCategories: [], benefits: [], features: [], useCasesExtras: []}
});

describe('ServiceLandingPageComponent', () => {
  let services: Record<string, Subject<unknown>>;
  let related: ReturnType<typeof vi.fn>;
  let myProviders: ReturnType<typeof vi.fn>;
  let user: UserInfo | null;

  beforeEach(() => {
    services = {argos: new Subject(), zenodo: new Subject()};
    related = vi.fn(() => of([{id: 'zenodo', name: 'Zenodo', tagline: 'Research shared', extras: {}}]));
    myProviders = vi.fn(() => of([{id: 'openaire'}]));
    user = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{
          path: 'service/:id', component: ServiceLandingPageComponent,
          children: [
            {path: 'overview', component: OverviewComponent},
            {path: 'miscellaneous', component: MiscellaneousComponent}
          ]
        }]),
        {
          provide: ResourceService, useValue: {
            getServiceOrDatasource: (id: string) => services[id],
            getUiVocabularies: () => of({}),
            getServicesByIdArray: related,
            getMyServiceProviders: myProviders
          }
        },
        {provide: UserSessionService, useValue: {get ready$() { return of(user); }}}
      ]
    });
  });

  const setUp = async (url: string) => {
    const fixture = TestBed.createComponent(AppHostComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const answer = (id: string, service: unknown) => {
      services[id].next(service);
      services[id].complete();
      fixture.detectChanges();
    };
    const go = async (next: string) => {
      await router.navigateByUrl(next);
      fixture.detectChanges();
    };
    const text = () => root.textContent!.replace(/\s+/g, ' ');
    const active = () => [...root.querySelectorAll('.uk-visible\\@m li.uk-active')].map(li => li.textContent!.trim());
    return {root, answer, go, text, active};
  };

  it('shows the loader until the service has loaded, then the menu and the tab', async () => {
    const {root, answer, text, active} = await setUp('/service/argos/overview');
    expect(root.querySelector('.loader-big')).not.toBeNull();
    expect(text()).not.toContain('Plan your data');

    answer('argos', makeService('argos', 'Plan your data', ['zenodo']));

    expect(root.querySelector('.loader-big')).toBeNull();
    expect(active()).toEqual(['Overview']);
    expect(text()).toContain('Plan your data');
    expect(text()).toContain('Zenodo');
    expect(related).toHaveBeenCalledWith(['zenodo']);
  });

  it('reverses the change log once, newest first', async () => {
    const {answer} = await setUp('/service/argos/overview');
    const service = makeService('argos', 'Plan your data');
    answer('argos', service);
    expect(service.extras.openAireChangeLog).toEqual(['newer', 'older']);
  });

  it('shows the service without related services when they fail to load', async () => {
    related.mockReturnValue(throwError(() => 'server down'));
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const {root, answer, text} = await setUp('/service/argos/overview');

    answer('argos', makeService('argos', 'Plan your data', ['zenodo']));

    expect(root.querySelector('.loader-big')).toBeNull();
    expect(text()).toContain('Plan your data');
    expect(text()).not.toContain('Zenodo');
    vi.mocked(console.log).mockRestore();
  });

  it('highlights the tab the user moves to', async () => {
    const {answer, go, active, text} = await setUp('/service/argos/overview');
    answer('argos', makeService('argos', 'Plan your data'));

    await go('/service/argos/miscellaneous');
    expect(active()).toEqual(['Operational Terms']);
    expect(text()).toContain('Important operational and legal service details');
  });

  it('keeps the current service shown while the next one loads', async () => {
    const {answer, go, text} = await setUp('/service/argos/overview');
    answer('argos', makeService('argos', 'Plan your data'));

    await go('/service/zenodo/overview');
    expect(text()).toContain('Plan your data');

    answer('zenodo', makeService('zenodo', 'Research shared'));
    expect(text()).toContain('Research shared');
    expect(text()).not.toContain('Plan your data');
  });

  it('offers editing only to members of the OpenAIRE provider', async () => {
    user = {sub: '1'} as UserInfo;
    const member = await setUp('/service/argos/overview');
    member.answer('argos', makeService('argos', 'Plan your data'));
    expect(member.root.querySelector('a[href="/service/edit/argos"]')).not.toBeNull();
  });

  it('does not offer editing to signed-out users', async () => {
    const signedOut = await setUp('/service/argos/overview');
    signedOut.answer('argos', makeService('argos', 'Plan your data'));
    expect(signedOut.root.querySelector('a[href="/service/edit/argos"]')).toBeNull();
    expect(myProviders).not.toHaveBeenCalled();
  });

  it('does not offer editing to members of other providers', async () => {
    user = {sub: '1'} as UserInfo;
    myProviders.mockReturnValue(of([{id: 'cern'}]));
    const other = await setUp('/service/argos/overview');
    other.answer('argos', makeService('argos', 'Plan your data'));
    expect(other.root.querySelector('a[href="/service/edit/argos"]')).toBeNull();
  });
});
