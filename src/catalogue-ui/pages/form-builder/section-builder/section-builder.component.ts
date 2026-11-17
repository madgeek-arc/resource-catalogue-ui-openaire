import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {GroupedFields, Section} from '../../../domain/dynamic-form-model';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {RichTextEditorComponent} from '../../../shared/rich-text-editor/rich-text-editor.component';

@Component({
    selector: 'app-section-builder',
    templateUrl: 'section-builder.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, FormsModule, RichTextEditorComponent]
})

export class SectionBuilderComponent {

  @Input() section: Section;


}
