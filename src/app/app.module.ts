import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {Router} from '@angular/router';
import * as Sentry from '@sentry/angular';
import {CommonModule, DatePipe, LowerCasePipe} from '@angular/common';
import {provideHttpClient, withInterceptors, withXhr} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';

import {AppRoutingModule} from './app.routing';
import {AireTopMenuComponent} from './shared/topmenu/topmenu.component';
import {AireFooterComponent} from './shared/footer/footer.component';

import {SearchAireComponent} from './pages/search/search.aire.component';

import {HomeAireComponent} from './pages/home/home.aire.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {ProviderModule} from './pages/provider/provider.module';
import {provideMatomo, withRouter} from 'ngx-matomo-client';
import {environment} from '../environments/environment';
import {PortfolioItemComponent} from './pages/landingpages/portfolio/portfolio-item.component';
import {UserItemComponent} from './pages/landingpages/user/user-item.component';
import {authenticationInterceptor} from './services/authentication-interceptor';
import {FormsComponent} from './pages/forms/forms.component';

import {DatasourceSearchComponent} from './pages/search/datasources-search/datasourceSearch.component';
import {Datasource} from './pages/landingpages/datasource/datasource';
import {ServiceWorkerModule} from '@angular/service-worker';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CookieLawComponent} from './shared/reusablecomponents/cookie-law/cookie-law.component';



@NgModule({
    declarations: [AppComponent],
    imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProviderModule,
    NgSelectModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
        // Register the ServiceWorker as soon as the app is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000'
    }),
    HomeAireComponent,
    SearchAireComponent,
    DatasourceSearchComponent,
    Datasource,
    PortfolioItemComponent,
    UserItemComponent,
    // ServiceLandingPageComponent,
    AireTopMenuComponent,
    AireFooterComponent,
    FormsComponent,
    CookieLawComponent,
],
    providers: [
        DatePipe,
        {
            provide: ErrorHandler,
            useValue: Sentry.createErrorHandler({
                showDialog: false,
            }),
        }, {
            provide: Sentry.TraceService,
            deps: [Router],
        },
        {
            provide: APP_INITIALIZER,
            useFactory: () => () => {
            },
            deps: [Sentry.TraceService],
            multi: true,
        },
        provideHttpClient(withXhr(), withInterceptors([authenticationInterceptor])),
        provideMatomo({
            scriptUrl: environment.MATOMO_URL + 'matomo.js',
            trackers: [
                {
                    trackerUrl: environment.MATOMO_URL,
                    siteId: environment.MATOMO_SITE
                }
            ]
        }, withRouter()),
    ],
    exports: [
        AireFooterComponent,
        AireTopMenuComponent,
        LowerCasePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
