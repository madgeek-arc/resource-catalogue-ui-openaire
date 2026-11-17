import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Section} from '../../../domain/dynamic-form-model';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {RichTextEditorComponent} from '../../../shared/rich-text-editor/rich-text-editor.component';

@Component({
    selector: 'app-chapter-builder',
    templateUrl: 'chapter-builder.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, FormsModule, RichTextEditorComponent]
})

export class ChapterBuilderComponent {

  @Input() chapter: Section = null;

}
