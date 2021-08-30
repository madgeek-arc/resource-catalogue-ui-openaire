import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ServiceLandingPageRouting} from './service-landing-page.routing';
import {ServiceLandingPageComponent} from './service-landing-page.component';
import {OverviewComponent} from './overview/overview.component';
import {PricingComponent} from './pricing/pricing.component';

@NgModule({
  declarations: [
    ServiceLandingPageComponent,
    OverviewComponent,
    PricingComponent
  ],
  imports: [
    CommonModule,
    ServiceLandingPageRouting
  ],
})

export class ServiceLandingPageModule {}
