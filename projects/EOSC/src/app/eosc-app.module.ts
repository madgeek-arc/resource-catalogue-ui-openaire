import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {EoscAppComponent} from './eosc-app.component';
import {HomeComponent} from './pages/home/home.component';
import {ResourceServiceExtended} from './services/resource.service.extended';
import {FooterComponent} from './shared/footer/footer.component';
import {BreadcrumbsComponent} from './shared/breadcrumbs/breadcrumbs.component';
import {TopMenuComponent} from './shared/topmenu/topmenu.component';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';
import {SearchExtendedComponent} from './pages/search/search.extended.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page.extended.component';
import {AppModule} from '../../../../src/app/app.module';
import {AppRoutingModule} from './app-routing.module';
import {ReusableComponentsModule} from '../../../../src/app/shared/reusablecomponents/reusable-components.module';
import {SharedModule} from '../../../../src/app/shared/shared.module';
import {StarRatingModule} from 'angular-star-rating';
import {ChartModule} from 'angular2-highcharts';


@NgModule({
  declarations: [
    EoscAppComponent,
    HomeComponent,
    BecomeAProviderComponent,
    SearchExtendedComponent,
    ServiceLandingPageExtendedComponent,
    // PERSISTENT
    FooterComponent,
    BreadcrumbsComponent,
    TopMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppModule,
    FormsModule,
    ReactiveFormsModule,
    ReusableComponentsModule,
    SharedModule,
    StarRatingModule.forRoot(),
    ChartModule
  ],
  providers: [
    ResourceServiceExtended
  ],
  bootstrap: [EoscAppComponent]
})
export class EoscAppModule {
}
