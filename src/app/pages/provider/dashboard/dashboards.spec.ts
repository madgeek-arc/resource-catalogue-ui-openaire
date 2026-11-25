import {ChangeDetectionStrategy, Component, forwardRef, input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgOptionComponent, NgSelectComponent} from '@ng-select/ng-select';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {URLParameter} from '../../../entities/url-parameter';
import {NavigationService} from '../../../services/navigation.service';
import {ProviderService} from '../../../services/provider.service';
import {ResourceService} from '../../../services/resource.service';
import {ServiceDashboardComponent} from '../../service-dashboard/service-dashboard.component';
import {ServiceHistoryComponent} from '../../service-dashboard/service-history.component';
import {ProviderDashboardComponent} from './provider-dashboard.component';
import {ProviderHomeComponent} from './provider-home/provider-home.component';
import {ProviderInfoComponent} from './provider-Info/provider-info.component';
import {ProviderServicesComponent} from './provider-services/provider-services.component';

// OnPush like AppComponent, so a check refreshes the dashboards only when they read a changed signal or marked themselves for check.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class AppHostComponent {}

// ng-select ships prebuilt and loads a second copy of Angular core under Vitest; these stand in for it.
@Component({
  selector: 'ng-select',
  template: '<ng-content />',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgSelectStubComponent), multi: true}]
})
class NgSelectStubComponent implements ControlValueAccessor {
  readonly items = input<unknown[]>();
  value: unknown;
  writeValue(value: unknown) { this.value = value; }
  registerOnChange() { /* not needed */ }
  registerOnTouched() { /* not needed */ }
}

@Component({selector: 'ng-option', template: '<ng-content />'})
class NgOptionStubComponent {
  readonly value = input<unknown>();
}

// Every vocabulary type the pages ask for, empty.
const noVocabularies = new Proxy({}, {get: () => []});

const log = [{type: 'onboard', actionType: 'approved', date: '1700000000000', userFullName: 'Ada Lovelace'}];
const providerBundle = (id: string, name: string) => ({
  id, status: 'approved', loggingInfo: log,
  provider: {
    id, name, abbreviation: name.slice(0, 3), website: 'https://example.org', logo: '',
    location: {}, mainContact: {}, affiliations: [], certifications: [], merilScientificDomains: [], multimedia: [],
    nationalRoadmaps: [], participatingCountries: [], scientificDomains: []
  }
});
const serviceBundle = (id: string, name: string, status: string) => ({
  id, status, active: true, latestUpdateInfo: {date: '1700000000000'}, metadata: {},
  service: {id, name, logo: '', resourceOrganisation: 'openaire', extras: {}}
});
const page = (total: number, from: number, ...results: unknown[]) => ({total, from, results});

describe('provider and service dashboards', () => {
  let bundles: Record<string, Subject<unknown>>;
  let servicesOf: ReturnType<typeof vi.fn>;
  let go: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    bundles = {openaire: new Subject(), cern: new Subject()};
    servicesOf = vi.fn(() => of(page(3, 0,
      serviceBundle('argos', 'Argos', 'approved'), serviceBundle('amnesia', 'Amnesia', 'pending'),
      serviceBundle('broker', 'Broker', 'rejected'))));
    go = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'provider/:providerId/dashboard', component: ProviderDashboardComponent, children: [
              {path: 'home', component: ProviderHomeComponent},
              {path: 'info', component: ProviderInfoComponent},
              {path: 'services', component: ProviderServicesComponent}
            ]
          },
          {
            path: 'service-dashboard/:providerId/:resourceId', component: ServiceDashboardComponent, children: [
              {path: 'history', component: ServiceHistoryComponent}
            ]
          }
        ]),
        {provide: ProviderService, useValue: {getProviderBundleById: (id: string) => bundles[id], getServicesOfProvider: servicesOf}},
        {
          provide: ResourceService, useValue: {
            getUiVocabularies: () => of(noVocabularies),
            getNewVocabulariesByType: () => of([]),
            getServiceOrDatasourceBundle: (id: string) => id === 'missing'
              ? throwError(() => ({status: 404}))
              : of({...serviceBundle(id, 'Argos', 'approved'), loggingInfo: log}),
            getDatasourceByServiceId: () => throwError(() => ({status: 404}))
          }
        },
        {provide: NavigationService, useValue: {go}}
      ]
    });
    TestBed.overrideComponent(ProviderServicesComponent, {
      remove: {imports: [NgSelectComponent, NgOptionComponent]},
      add: {imports: [NgSelectStubComponent, NgOptionStubComponent]}
    });
  });

  const open = async (url: string) => {
    const fixture = TestBed.createComponent(AppHostComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const answer = async (id: string, value: unknown) => {
      bundles[id].next(value);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const go = async (next: string) => {
      await router.navigateByUrl(next);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const text = () => root.textContent!.replace(/\s+/g, ' ');
    return {fixture, root, router, answer, go, text};
  };

  describe('ProviderDashboardComponent with its home page', () => {
    it('loads the provider services once the provider has arrived, sorted by status', async () => {
      const {answer, text} = await open('/provider/openaire/dashboard/home');
      expect(servicesOf).not.toHaveBeenCalled();
      expect(text()).not.toContain('Argos');

      await answer('openaire', providerBundle('openaire', 'OpenAIRE'));

      expect(text()).toContain('Admin - OpenAIRE');
      expect(text()).toContain('Home');
      expect(servicesOf).toHaveBeenCalledWith('openaire', [{key: 'quantity', values: ['1000']}, {key: 'sort', values: ['modifiedAt']}, {key: 'order', values: ['desc']}]);
      for (const name of ['Argos', 'Amnesia', 'Broker']) {
        expect(text()).toContain(name);
      }
      expect(text()).toContain('Onboard - Approved');
    });

    it('shows the next provider when the user switches provider, with the dashboard reused', async () => {
      const {fixture, answer, go, text} = await open('/provider/openaire/dashboard/home');
      await answer('openaire', providerBundle('openaire', 'OpenAIRE'));
      const dashboard = () => fixture.debugElement.query(debug => debug.componentInstance instanceof ProviderDashboardComponent).componentInstance;
      const before = dashboard();

      await go('/provider/cern/dashboard/home');
      await answer('cern', providerBundle('cern', 'CERN'));

      expect(dashboard()).toBe(before);
      expect(text()).toContain('Admin - CERN');
      expect(servicesOf).toHaveBeenLastCalledWith('cern', [{key: 'quantity', values: ['1000']}, {key: 'sort', values: ['modifiedAt']}, {key: 'order', values: ['desc']}]);
    });

    it('leaves route reuse on for the rest of the app', async () => {
      const {answer, router} = await open('/provider/openaire/dashboard/home');
      await answer('openaire', providerBundle('openaire', 'OpenAIRE'));
      const route = router.routerState.snapshot.root;
      expect(router.routeReuseStrategy.shouldReuseRoute(route, route)).toBe(true);
    });

    it('titles and highlights the section the user moves to', async () => {
      const {root, answer, go, text} = await open('/provider/openaire/dashboard/home');
      await answer('openaire', providerBundle('openaire', 'OpenAIRE'));

      await go('/provider/openaire/dashboard/info');
      expect(text()).toContain('Provider\'s profile');
      expect(root.querySelector('.current_section')!.textContent).toContain('info');
    });

    // The sections type the outlet data as never null, which relies on this.
    it('shows no section until the provider has loaded', async () => {
      const {root, answer, text} = await open('/provider/openaire/dashboard/info');
      expect(root.querySelector('app-provider-info')).toBeNull();

      await answer('openaire', providerBundle('openaire', 'OpenAIRE'));

      expect(root.querySelector('app-provider-info')).not.toBeNull();
      expect(text()).toContain('OpenAIRE');
    });

    it('shows the profile of the provider', async () => {
      const {answer, text} = await open('/provider/openaire/dashboard/info');
      await answer('openaire', providerBundle('openaire', 'OpenAIRE'));
      expect(text()).toContain('OpenAIRE');
      expect(text()).toContain('Ope');
    });
  });

  describe('ProviderServicesComponent', () => {
    it('waits for the provider, then asks for the first page of 9', async () => {
      const {answer, text} = await open('/provider/openaire/dashboard/services');
      expect(servicesOf).not.toHaveBeenCalled();

      await answer('openaire', providerBundle('openaire', 'OpenAIRE'));

      expect(servicesOf).toHaveBeenCalledWith('openaire', [{key: 'quantity', values: ['9']}] as URLParameter[]);
      expect(text()).toContain('3 Services, Page 1 of 1');
    });

    it('keeps the filters in the URL of this provider and goes back to the first page', async () => {
      const {router, answer, fixture} = await open('/provider/cern/dashboard/services?from=9');
      await answer('cern', providerBundle('cern', 'CERN'));

      const services = fixture.debugElement.query(debug => debug.componentInstance instanceof ProviderServicesComponent)
        .componentInstance as ProviderServicesComponent;
      await services.filterSelection('active', 'true');

      expect(router.url).toBe('/provider/cern/dashboard/services?from=0&quantity=9&active=true');
      expect(services.activeStatus()).toBe('true');
    });

    it('moves the page number at once on next', async () => {
      servicesOf.mockReturnValue(of(page(30, 0, serviceBundle('argos', 'Argos', 'approved'))));
      const {router, answer, root, fixture, text} = await open('/provider/openaire/dashboard/services');
      await answer('openaire', providerBundle('openaire', 'OpenAIRE'));
      expect(text()).toContain('Page 1 of 4');

      servicesOf.mockReturnValue(new Subject());
      [...root.querySelectorAll<HTMLAnchorElement>('.uk-pagination a')].find(a => a.querySelector('[uk-pagination-next]'))!.click();
      fixture.detectChanges();
      expect(text()).toContain('Page 2 of 4');
      await fixture.whenStable();
      expect(router.url).toBe('/provider/openaire/dashboard/services?quantity=9&from=9');
    });
  });

  describe('ServiceDashboardComponent', () => {
    it('passes the service to its history page', async () => {
      const {text} = await open('/service-dashboard/openaire/argos/history');
      expect(text()).toContain('Argos Dashboard');
      expect(text()).toContain('Approved');
    });

    it('goes to 404 for an unknown service', async () => {
      await open('/service-dashboard/openaire/missing/history');
      expect(go).toHaveBeenCalledWith('/404');
    });
  });
});
