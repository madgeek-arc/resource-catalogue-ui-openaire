import {ChangeDetectionStrategy, Component, signal, Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, provideRouter, Router, RouterOutlet} from '@angular/router';
import {of} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {ProviderBundle} from '../entities/eic-model';
import {OverviewComponent} from './landingpages/service/overview/overview.component';
import {MiscellaneousComponent} from './landingpages/service/miscellaneous/miscellaneous.component';
import {PricingComponent} from './landingpages/service/pricing/pricing.component';
import {ChangeLogComponent} from './landingpages/service/resourcesAndSupport/changeLog/change-log.component';
import {ResourcesAndSupportComponent} from './landingpages/service/resourcesAndSupport/resourcesAndSupport.component';
import {ProviderFullHistoryComponent} from './provider/dashboard/provider-history/provider-full-history.component';
import {ProviderHistoryComponent} from './provider/dashboard/provider-history/provider-history.component';
import {ProviderJoinComponent} from './provider/join/provider-join.component';
import {ServiceFullHistoryComponent} from './service-dashboard/service-full-history.component';
import {ServiceHistoryComponent} from './service-dashboard/service-history.component';

// Stands in for the parent pages (provider and service dashboards, service landing page): they pass their
// data through [routerOutletData] and get it from the server after the child page is already shown.
// A signal, as in those parents: without zone.js a plain field set from the test would not mark the host for check.
// Eager, so every fixture check passes the host's data down; the child page must pick it up by itself.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet [routerOutletData]="data()" />',
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- Eager on purpose, see above
  changeDetection: ChangeDetectionStrategy.Eager
})
class ParentComponent {
  readonly data = signal<unknown>(null);
}

// The history pages show the action ("Approved"), the full-history pages the user ("Ada Lovelace").
const log = [{type: 'onboard', actionType: 'approved', date: '1700000000000', userFullName: 'Ada Lovelace'}];
const providerBundle = {id: 'openaire', loggingInfo: log, metadata: {registeredBy: 'Ada', registeredAt: '1700000000000'}} as unknown as ProviderBundle;
const serviceBundle = {id: 's1', service: {resourceOrganisation: 'openaire'}, loggingInfo: log, metadata: {registeredBy: 'Ada', registeredAt: '1700000000000'}};
const service = {
  id: 's1',
  tagline: 'Plan your data',
  targetUsers: ['researchers'],
  relatedResources: ['s2'],
  termsOfUse: 'https://example.org/terms',
  extras: {
    openAireChangeLog: [{changeLogVersion: '2.0', changeDate: '1700000000000', logs: [{type: 'Fixed', value: 'A bug'}, {type: 'Other', value: 'Misc'}]}],
    benefits: [],
    features: [],
    useCasesExtras: [],
    paymentCategories: [
      {paymentTitle: 'Free', paymentHighlight: 'false'},
      {paymentTitle: 'Pro', paymentHighlight: 'true'}
    ]
  }
};
// What ServiceLandingPageComponent passes to its tabs.
const landing = {
  service,
  vocabularies: {'Target user': [{id: 'researchers', name: 'Researchers'}]},
  relatedServices: [{id: 's2', name: 'Zenodo', tagline: 'Research shared', extras: {}}]
};

describe('pages that get their data through the router outlet', () => {
  const setUp = async (component: Type<unknown>, path = 'page') => {
    TestBed.configureTestingModule({providers: [provideRouter([{path: ':x', component}])]});
    const fixture = TestBed.createComponent(ParentComponent);
    await TestBed.inject(Router).navigateByUrl('/' + path);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const show = (data: unknown) => {
      fixture.componentInstance.data.set(data);
      fixture.detectChanges();
    };
    return {root, show, text: () => root.textContent!.replace(/\s+/g, ' ')};
  };

  it.each([
    [ProviderHistoryComponent, providerBundle, 'Approved'],
    [ProviderFullHistoryComponent, providerBundle, 'Ada Lovelace'],
    [ServiceHistoryComponent, serviceBundle, 'Approved'],
    [ServiceFullHistoryComponent, serviceBundle, 'Ada Lovelace'],
  ] as [Type<unknown>, unknown, string][])('%o shows the history once the bundle arrives', async (component, bundle, entry) => {
    const {show, text} = await setUp(component);
    expect(text()).not.toContain(entry);

    show(bundle);
    expect(text()).toContain(entry);
  });

  it('links the provider history to the full history of that provider', async () => {
    const {root, show} = await setUp(ProviderHistoryComponent);
    show(providerBundle);
    expect(root.querySelector('[href="/provider/openaire/dashboard/fullHistory"]')).not.toBeNull();
  });

  it('shows the miscellaneous tab once the service arrives', async () => {
    const {show, text} = await setUp(MiscellaneousComponent);
    expect(text().trim()).toBe('');

    show(landing);
    expect(text()).toContain('Important operational and legal service details');
  });

  it('shows the overview with vocabulary names and related services once the data arrives', async () => {
    const {show, text} = await setUp(OverviewComponent);
    expect(text().trim()).toBe('');

    show(landing);
    expect(text()).toContain('Plan your data');
    expect(text()).toContain('Researchers');
    expect(text()).toContain('Zenodo');
  });

  it('highlights the pricing plans marked as highlighted', async () => {
    const {root, show} = await setUp(PricingComponent);
    show(landing);
    const cards = [...root.querySelectorAll('.uk-card')];
    expect(cards.map(card => card.classList.contains('uk-card-primary'))).toEqual([false, true]);
    expect(cards.map(card => card.classList.contains('uk-card-default'))).toEqual([true, false]);
  });

  it.each([
    [ChangeLogComponent],
    [ResourcesAndSupportComponent],
  ] as [Type<unknown>][])('%o colours the change-log badges by type', async component => {
    const {root, show} = await setUp(component);
    show(landing);
    const badges = [...root.querySelectorAll<HTMLElement>('.badge-success')];
    expect(badges.map(badge => [badge.textContent!.trim(), badge.style.backgroundColor])).toEqual([
      ['Fixed', 'rgb(240, 80, 110)'],
      ['Other', '']
    ]);
  });

  it('hides the change-log links in the clean view', async () => {
    const full = await setUp(ChangeLogComponent, 'changeLog');
    full.show(landing);
    const linksInFullView = full.root.querySelectorAll('a, button').length;
    TestBed.resetTestingModule();

    const clean = await setUp(ChangeLogComponent, 'changeLogClean');
    clean.show(landing);
    expect(clean.root.querySelectorAll('a, button').length).toBeLessThan(linksInFullView);
  });
});

describe('ProviderJoinComponent', () => {
  beforeEach(() => sessionStorage.removeItem('token'));
  afterEach(() => sessionStorage.removeItem('token'));

  it('keeps the invitation token for the provider form', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), {provide: ActivatedRoute, useValue: {params: of({token: 'abc'})}}]
    });
    TestBed.createComponent(ProviderJoinComponent).detectChanges();
    expect(sessionStorage.getItem('token')).toBe('abc');
  });
});
