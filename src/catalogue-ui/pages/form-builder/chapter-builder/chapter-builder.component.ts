import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Section} from '../../../domain/dynamic-form-model';
import {ClassicEditor} from '../../../domain/ckeditor-classic-editor';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
    selector: 'app-chapter-builder',
    templateUrl: 'chapter-builder.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, FormsModule, CKEditorModule]
})

export class ChapterBuilderComponent {

  @Input() chapter: Section = null;

  public editor = ClassicEditor;
}
