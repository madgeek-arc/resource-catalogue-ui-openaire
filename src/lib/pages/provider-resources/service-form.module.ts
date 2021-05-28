import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { DynamicFormFieldsComponent } from './dynamic-service-form/dynamic-form-fields.component';
import { DynamicFormTestComponent } from './dynamic-service-form/dynamic-form-test.component';
import { DynamicFormComponent } from './dynamic-service-form/dynamic-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReusableComponentsModule } from '../../shared/reusablecomponents/reusable-components.module';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgSelectModule,
    ReusableComponentsModule,
    LMarkdownEditorModule,
  ],
  declarations: [
    DynamicFormComponent,
    DynamicFormTestComponent,
    DynamicFormFieldsComponent,
  ],
})
export class ServiceFormModule {
}
