import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {GroupedFields, Section} from '../../../domain/dynamic-form-model';
import {ClassicEditor} from '../../../domain/ckeditor-classic-editor';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
    selector: 'app-section-builder',
    templateUrl: 'section-builder.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, FormsModule, CKEditorModule]
})

export class SectionBuilderComponent {

  @Input() section: Section;

  public editor = ClassicEditor;

}
