import {DatePipe} from '@angular/common';
import {provideHttpClient, withInterceptors, withXhr} from '@angular/common/http';
import {ApplicationConfig, ErrorHandler, inject, provideAppInitializer, provideZonelessChangeDetection} from '@angular/core';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideRouter, Router, withRouterConfig} from '@angular/router';
import {provideServiceWorker} from '@angular/service-worker';
import * as Sentry from '@sentry/angular';
import {provideMatomo, withRouter} from 'ngx-matomo-client';
import {environment} from '../environments/environment';
import {routes} from './app.routes';
import {authenticationInterceptor} from './services/authentication-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // No zone.js: views refresh on signals, template and host listeners, markForCheck and the async pipe.
    provideZonelessChangeDetection(),
    provideRouter(routes, withRouterConfig({onSameUrlNavigation: 'reload'})),
    provideHttpClient(withXhr(), withInterceptors([authenticationInterceptor])),
    // The cookie banner uses @angular/animations.
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      // Register the service worker as soon as the app is stable, or after 30 seconds, whichever comes first.
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideMatomo(
      {
        scriptUrl: environment.MATOMO_URL + 'matomo.js',
        trackers: [
          {
            trackerUrl: environment.MATOMO_URL,
            siteId: environment.MATOMO_SITE,
          },
        ],
      },
      withRouter(),
    ),
    DatePipe,
    {provide: ErrorHandler, useValue: Sentry.createErrorHandler({showDialog: false})},
    {provide: Sentry.TraceService, deps: [Router]},
    // Creates the TraceService at startup, so Sentry follows navigations from the first one.
    provideAppInitializer(() => {
      inject(Sentry.TraceService);
    }),
  ],
};
