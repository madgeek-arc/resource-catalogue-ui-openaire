import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {ProviderRouting} from './provider.routing';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {UpdateServiceProviderComponent} from './update-service-provider.component';
import {NgSelectModule} from '@ng-select/ng-select';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProviderRouting,
    ReusableComponentsModule,
    NgSelectModule,

  ],
  declarations: [
    ServiceProviderFormComponent,
    UpdateServiceProviderComponent,
  ]
})

export class ProviderModule {
}
