import {DatePipe} from '@angular/common';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {isSignal, Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {describe, expect, it} from 'vitest';
import {OverviewComponent} from './pages/landingpages/service/overview/overview.component';
import {ProviderInfoComponent} from './pages/provider/dashboard/provider-Info/provider-info.component';
import {ProviderHomeComponent} from './pages/provider/dashboard/provider-home/provider-home.component';
import {ProviderServicesComponent} from './pages/provider/dashboard/provider-services/provider-services.component';

/**
 * Some pages get their data from the parent page: the parent's (activate) handler on its router outlet assigns
 * fields of the routed component (ServiceLandingPageComponent.onOutletLoaded, ProviderDashboardComponent.onActivate).
 * Those fields must stay plain properties. A signal input there is replaced by the plain value, and the page then
 * fails as soon as it calls it (the signal-input migration cannot see these untyped assignments).
 */
describe('fields assigned by a router outlet', () => {
  it.each([
    [OverviewComponent, 'vocabularies'],
    [OverviewComponent, 'resourcePayload'],
    [OverviewComponent, 'relatedServices'],
    [ProviderHomeComponent, 'providerBundle'],
    [ProviderInfoComponent, 'providerBundle'],
    [ProviderServicesComponent, 'providerBundle'],
  ] as [Type<object>, string][])('%o.%s is a plain property', (component, field) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: ActivatedRoute, useValue: {}},
        DatePipe, // provided app-wide in app.config.ts
      ],
    });
    const instance = TestBed.runInInjectionContext(() => new component()) as Record<string, unknown>;

    expect(isSignal(instance[field])).toBe(false);
  });
});
