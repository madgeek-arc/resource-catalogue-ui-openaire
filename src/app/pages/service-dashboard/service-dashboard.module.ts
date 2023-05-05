import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {ServiceHistoryComponent} from './service-history.component';
import {ServiceFullHistoryComponent} from './service-full-history.component';
import {ServiceDashboardRouting} from './service-dashboard.routing';
import {ServiceDashboardComponent} from './service-dashboard.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceDashboardRouting,
    ReusableComponentsModule,
  ],
  declarations: [
    ServiceDashboardComponent,
    ServiceHistoryComponent,
    ServiceFullHistoryComponent
  ]
})

export class ServiceDashboardModule {
}
