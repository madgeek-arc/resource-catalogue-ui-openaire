import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {HomeComponent} from '../lib/pages/home/home.component';
import {SharedModule} from '../lib/shared/shared.module';
import {AppRoutingModule} from './app.routing';
import {AuthenticationService} from '../lib/services/authentication.service';
import {CanActivateViaAuthGuard} from '../lib/services/can-activate-auth-guard.service';
import {NavigationService} from '../lib/services/navigation.service';
import {ResourceService} from '../lib/services/resource.service';
import {CanActivateViaPubGuard} from '../lib/services/can-activate-pub-guard.service';
import {TopMenuComponent} from '../lib/shared/topmenu/topmenu.component';
import {FooterComponent} from '../lib/shared/footer/footer.component';
import {AireTopMenuComponent} from './shared/topmenu/topmenu.component';
import {AireFooterComponent} from './shared/footer/footer.component';
import {BreadcrumbsComponent} from '../lib/shared/breadcrumbs/breadcrumbs.component';
import {FeedbackComponent} from '../lib/shared/feedback/feedback.component';
import {ServiceProviderFormComponent} from '../lib/pages/provider/service-provider-form.component';
import {MyServiceProvidersComponent} from '../lib/pages/provider/my-service-providers.component';
import {AddFirstServiceComponent} from '../lib/pages/provider/add-first-service.component';
import {ServiceProviderInfoComponent} from '../lib/pages/provider/service-provider-info.component';
import {UpdateServiceProviderComponent} from '../lib/pages/provider/update-service-provider.component';
import {ReusableComponentsModule} from '../lib/shared/reusablecomponents/reusable-components.module';
import {ServiceProviderService} from '../lib/services/service-provider.service';
import {ServiceProvidersListComponent} from '../lib/pages/admin/service-providers-list.component';
import {SupportModule} from '../lib/pages/support/support.module';
import {ServiceStatsComponent} from '../lib/pages/provider/dashboard/resource-dashboard/service-stats.component';
import {MyFavouritesComponent} from '../lib/pages/user/favourites/my-favourites.component';
import {DashboardComponent} from '../lib/pages/provider/dashboard/dashboard.component';
import {UserService} from '../lib/services/user.service';
import {ComparisonService} from '../lib/services/comparison.service';
import {UserModule} from '../lib/pages/user/user.module';
import {BrowseCategoriesComponent} from '../lib/pages/browsecategories/browse-categories.component';
import {SearchComponent} from '../lib/pages/search/search.component';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {ProvidersStatsComponent} from '../lib/pages/stats/providers-stats.component';
import {ResourcesStatsComponent} from '../lib/pages/stats/resources-stats.component';
import {CompareServicesComponent} from '../lib/pages/compare/compare-services.component';
import {ServiceFormComponent} from '../lib/pages/provider-resources/service-form.component';
import {ServiceUploadComponent} from '../lib/pages/provider-resources/service-upload.component';
import {ServiceEditComponent} from '../lib/pages/provider-resources/service-edit.component';
import {MeasurementsComponent} from '../lib/pages/indicators/measurements.component';
import {IndicatorFromComponent} from '../lib/pages/indicators/indicator-from.component';
import {AuthenticationInterceptor} from '../lib/services/authentication-interceptor';
import {CookieLawModule} from '../lib/shared/reusablecomponents/cookie-law/cookie-law.module';
import {EmailService} from '../lib/services/email.service';
import {TreeviewModule} from 'ngx-treeview';
import {HomeAireComponent} from './pages/home/home.aire.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {ProviderModule} from '../lib/pages/provider/provider.module';
import {MarkdownModule} from 'ngx-markdown';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {MatomoModule} from 'ngx-matomo';
import {ServiceFormModule} from '../lib/pages/provider-resources/service-form.module';
import {VocabularyRequestsComponent} from '../lib/pages/admin/vocabulary-requests.component';
import {HighchartsChartModule} from 'highcharts-angular';
import {FormControlService} from '../lib/pages/provider-resources/dynamic-service-form/form-control.service';
import {environment} from '../environments/environment';
import {PortfolioItemComponent} from './pages/landingpages/portfolio/portfolio-item.component';
import {UserItemComponent} from './pages/landingpages/user/user-item.component';
import {ServiceLandingPageModule} from './pages/landingpages/service/service-landing-page.module';
import {ServiceLandingPageComponent} from '../lib/pages/landingpages/service/service-landing-page.component';


declare var require: any;

@NgModule({
  declarations: [
    // MAIN
    AppComponent,
    BrowseCategoriesComponent,
    CompareServicesComponent,
    HomeComponent,
    HomeAireComponent,
    SearchComponent,
    SearchAireComponent,
    ProvidersStatsComponent,
    ResourcesStatsComponent,
    PortfolioItemComponent,
    UserItemComponent,
    ServiceLandingPageComponent,
    // PERSISTENT
    TopMenuComponent,
    AireTopMenuComponent,
    // BreadcrumbsComponent,
    FooterComponent,
    AireFooterComponent,
    FeedbackComponent,
    // USER
    // DashboardComponent,
    // MyFavouritesComponent,
    // ServiceStatsComponent,
    // // SERVICE PROVIDER ADMIN
    // ServiceProviderFormComponent,
    // ServiceProviderInfoComponent,
    // UpdateServiceProviderComponent,
    // AddFirstServiceComponent,
    // MyServiceProvidersComponent,
    // ADMIN
    // ServiceProvidersListComponent,
    // INDICATORS
    MeasurementsComponent,
    IndicatorFromComponent,
    // FORMS
    // ServiceEditComponent,
    // ServiceEditExtendedComponent,
    // ServiceFormComponent,
    // ServiceUploadComponent,
    // ServiceUploadExtendedComponent,
    VocabularyRequestsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ReusableComponentsModule,
    SharedModule,
    TreeviewModule.forRoot(),
    // StarRatingModule.forRoot(),
    SupportModule,
    UserModule,
    ProviderModule,
    // ServiceLandingPageModule,
    ServiceFormModule,
    // ProviderDashboardModule,
    HighchartsChartModule,
    CookieLawModule,
    NgSelectModule,
    MatomoModule.forRoot({
      scriptUrl: environment.MATOMO_URL + 'matomo.js',
      trackers: [
        {
          trackerUrl: environment.MATOMO_URL + 'matomo.php',
          siteId: environment.MATOMO_SITE
        }
      ],
      routeTracking: {
        enable: true
      }
    }),
    LMarkdownEditorModule,
    MarkdownModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    AuthenticationService,
    ComparisonService,
    CanActivateViaAuthGuard,
    CanActivateViaPubGuard,
    NavigationService,
    ResourceService,
    UserService,
    ServiceProviderService,
    EmailService,
    FormControlService,
    DatePipe
  ],
  exports: [
    AireFooterComponent,
    AireTopMenuComponent,
    BreadcrumbsComponent,
    FeedbackComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
