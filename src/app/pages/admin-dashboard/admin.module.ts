import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


import {NgSelectModule} from '@ng-select/ng-select';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {AdminRouting} from './admin.routing';
import {AdminDashboardComponent} from './admin-dashboard.component';
import {AllProvidersDashboardComponent} from './providers/all-providers.component';
import {AllServicesDashboardComponent} from './services/all-services.component';
import {AllDatasourcesDashboardComponent} from './datasources/all-datasources.component';


@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRouting,
    NgSelectModule,
    CKEditorModule,
    AdminDashboardComponent,
    AllProvidersDashboardComponent,
    AllServicesDashboardComponent,
    AllDatasourcesDashboardComponent,
]
})

export class AdminModule {
}
