import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


import {ServiceHistoryComponent} from './service-history.component';
import {ServiceFullHistoryComponent} from './service-full-history.component';
import {ServiceDashboardRouting} from './service-dashboard.routing';
import {ServiceDashboardComponent} from './service-dashboard.component';

@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceDashboardRouting,
    ServiceDashboardComponent,
    ServiceHistoryComponent,
    ServiceFullHistoryComponent,
]
})

export class ServiceDashboardModule {
}
