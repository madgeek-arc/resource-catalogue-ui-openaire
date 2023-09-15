import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {AdminRouting} from './admin.routing';
import {AdminDashboardComponent} from './admin-dashboard.component';
import {AllProvidersDashboardComponent} from './providers/all-providers.component';
import {AllServicesDashboardComponent} from './services/all-services.component';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRouting,
    ReusableComponentsModule,
    NgSelectModule,
    CKEditorModule,
  ],
  declarations: [
    AdminDashboardComponent,
    AllProvidersDashboardComponent,
    AllServicesDashboardComponent
  ]
})

export class AdminModule {
}
