import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, provideRouter, Router} from '@angular/router';
import {of} from 'rxjs';
import {describe, expect, it, vi} from 'vitest';
import {routes} from './app.routes';
import {UserSessionService} from './services/user-session.service';
import {UserInfo} from './entities/userInfo';
import {FormsComponent} from './pages/forms/forms.component';
import {AllProvidersDashboardComponent} from './pages/admin-dashboard/providers/all-providers.component';
import {OverviewComponent} from './pages/landingpages/service/overview/overview.component';
import {ProviderHomeComponent} from './pages/provider/dashboard/provider-home/provider-home.component';
import {ProviderServicesComponent} from './pages/provider/dashboard/provider-services/provider-services.component';
import {ServiceProviderFormComponent} from './pages/provider/form/service-provider-form.component';
import {UpdateServiceProviderComponent} from './pages/provider/form/update-service-provider.component';
import {ServiceHistoryComponent} from './pages/service-dashboard/service-history.component';
import {NotFoundPageComponent} from './shared/not-found-page/not-found-page.component';

/**
 * Navigates the real route table (lazy children included) without rendering anything: there is no router outlet,
 * so the routes are recognised and activated but no component is created.
 */
describe('app routes', () => {
  const setUp = (user: UserInfo | null) => {
    const session = {ready$: of(user), login: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: UserSessionService, useValue: session},
      ],
    });
    return {router: TestBed.inject(Router), session};
  };

  const leaf = (router: Router): ActivatedRouteSnapshot => {
    let snapshot = router.routerState.snapshot.root;
    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }
    return snapshot;
  };

  const signedIn = {sub: 's', name: 'Ada'} as UserInfo;

  it.each([
    ['/provider/add', '/provider/add', ServiceProviderFormComponent],
    ['/provider/p1', '/provider/p1/dashboard/home', ProviderHomeComponent],
    ['/provider/p1/dashboard/services', '/provider/p1/dashboard/services', ProviderServicesComponent],
    ['/provider/p1/update', '/provider/p1/update', UpdateServiceProviderComponent],
    ['/provider/p1/service/add', '/provider/p1/service/add', FormsComponent],
    ['/service-dashboard/p1/s1', '/service-dashboard/p1/s1/history', ServiceHistoryComponent],
    ['/admin', '/admin/providers', AllProvidersDashboardComponent],
    ['/service/athenarc.amnesia', '/service/athenarc.amnesia/overview', OverviewComponent],
    ['/nowhere', '/notFound', NotFoundPageComponent],
  ] as [string, string, Type<unknown>][])('signed in, %s ends at %s', async (url, finalUrl, component) => {
    const {router} = setUp(signedIn);

    expect(await router.navigateByUrl(url)).toBe(true);
    expect(router.url).toBe(finalUrl);
    expect(leaf(router).component).toBe(component);
  });

  it.each(['/provider/add', '/provider/p1/dashboard/home', '/admin/services', '/service-dashboard/p1/s1/history'])(
    'signed out, %s sends the visitor to log in and back to the same page',
    async url => {
      const {router, session} = setUp(null);

      expect(await router.navigateByUrl(url)).toBe(false);
      expect(session.login).toHaveBeenCalledWith(url);
    },
  );
});
