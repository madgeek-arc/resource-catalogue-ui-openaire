import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {Field, HandleBitSet} from '../../../domain/dynamic-form-model';
import { CompositeFieldComponent } from './composite-field/composite-field.component';
import { ChooseOneComponent } from './choose-one-composite/choose-one.component';
import { StringFieldComponent } from './string-field/string-field.component';
import { NumberFieldComponent } from './number-field/number-field.component';
import { VocabularyFieldComponent } from './dropdown-field/vocabulary-field.component';
import { LargeTextFieldComponent } from './large-text-field/large-text-field.component';
import { RadioButtonFieldComponent } from './radio-button-field/radio-button-field.component';
import { RichTextFieldComponent } from './rich-text-field/rich-text-field.component';
import { DateFieldComponent } from './date-field/date-field.component';

@Component({
    selector: 'app-field',
    templateUrl: './dynamic-form-fields.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, CompositeFieldComponent, ChooseOneComponent, StringFieldComponent, NumberFieldComponent, VocabularyFieldComponent, LargeTextFieldComponent, RadioButtonFieldComponent, RichTextFieldComponent, DateFieldComponent]
})
export class DynamicFormFieldsComponent {
  @Input() fieldData: Field;
  @Input() form: UntypedFormGroup;
  @Input() vocabularies: Map<string, object[]>;
  @Input() subVocabularies: Map<string, object[]> = null;
  @Input() editMode: any;
  @Input() readonly: boolean = null;

  @Output() hasChanges = new EventEmitter<boolean>();
  @Output() handleBitSets = new EventEmitter<Field>();
  @Output() handleBitSetsOfComposite = new EventEmitter<HandleBitSet>();

  /** Bitsets--> **/

  updateBitSet(fieldData: Field) {
    this.timeOut(200).then(() => { // Needed for radio buttons strange behaviour
      if (fieldData.form.mandatory) {
        this.handleBitSets.emit(fieldData);
      }
    });
  }

  updateBitSetOfComposite(fieldData: Field, position: number) {
    if (fieldData.form.mandatory) {
      const tmp = new HandleBitSet();
      tmp.field = fieldData;
      tmp.position = position;
      this.handleBitSetsOfComposite.emit(tmp);
    }
  }

  handleCompositeBitsetOfChildren(data: HandleBitSet) {
    this.handleBitSetsOfComposite.emit(data);
  }

  handleBitsetOfChildren(data: Field) {
    this.handleBitSets.emit(data);
  }

  unsavedChangesPrompt() {
    this.hasChanges.emit(true);
  }

  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // printToConsole(name: string) {
  //   console.log(this.form.get(name).valid)
  // }

}
