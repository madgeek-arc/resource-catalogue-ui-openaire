import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ServiceLandingPageRouting} from './service-landing-page.routing';
import {ServiceLandingPageComponent} from './service-landing-page.component';
import {OverviewComponent} from './overview/overview.component';
import {PricingComponent} from './pricing/pricing.component';
import {ResourcesAndSupportComponent} from './resourcesAndSupport/resourcesAndSupport.component';
import {MiscellaneousComponent} from './miscellaneous/miscellaneous.component';
import {ChangeLogComponent} from './resourcesAndSupport/changeLog/change-log.component';


@NgModule({
    imports: [
    CommonModule,
    ServiceLandingPageRouting,
    FormsModule,
    ServiceLandingPageComponent,
    OverviewComponent,
    PricingComponent,
    ResourcesAndSupportComponent,
    MiscellaneousComponent,
    ChangeLogComponent
],
})

export class ServiceLandingPageModule {}
