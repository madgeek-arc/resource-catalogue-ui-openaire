import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {ProviderRouting} from './provider.routing';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {ServiceProviderFormComponent} from './form/service-provider-form.component';
import {UpdateServiceProviderComponent} from './form/update-service-provider.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {ProviderDashboardComponent} from './dashboard/provider-dashboard.component';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {ProviderInfoComponent} from './dashboard/provider-Info/provider-info.component';
import {ProviderHistoryComponent} from './dashboard/provider-history/provider-history.component';
import {ProviderFullHistoryComponent} from './dashboard/provider-history/provider-full-history.component';
import {ProviderServicesComponent} from './dashboard/provider-services/provider-services.component';
import {ProviderHomeComponent} from './dashboard/provider-home/provider-home.component';
import {ProviderJoinComponent} from './join/provider-join.component';
import {JoinComponent} from '../public/join.component';
import {AboutComponent} from '../public/about.component';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProviderRouting,
    ReusableComponentsModule,
    NgSelectModule,
    CKEditorModule,
  ],
  declarations: [
    ServiceProviderFormComponent,
    UpdateServiceProviderComponent,
    ProviderDashboardComponent,
    ProviderHomeComponent,
    ProviderInfoComponent,
    ProviderHistoryComponent,
    ProviderFullHistoryComponent,
    ProviderServicesComponent,
    ProviderJoinComponent,
    JoinComponent,
    AboutComponent
  ]
})

export class ProviderModule {
}
