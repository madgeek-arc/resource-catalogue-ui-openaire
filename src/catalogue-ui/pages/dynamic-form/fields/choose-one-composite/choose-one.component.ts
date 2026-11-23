import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import {formFieldRefresher} from '../../../../shared/form-refresh';
import {Field, HandleBitSet, UiVocabulary} from '../../../../domain/dynamic-form-model';
import { UntypedFormArray, UntypedFormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import {FormControlService} from '../../../../services/form-control.service';
import { ReadMoreTextComponent } from '../../../../shared/reusable-components/read-more.component';
import { CompositeFieldComponent } from '../composite-field/composite-field.component';
import { StringFieldComponent } from '../string-field/string-field.component';

@Component({
    selector: 'app-choose-one',
    templateUrl: './choose-one.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, ReadMoreTextComponent, CompositeFieldComponent, StringFieldComponent]
})

export class ChooseOneComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);
  /** Refreshes this field when its controls change, whoever changes them. */
  private readonly refresh = formFieldRefresher();
  private formService = inject(FormControlService);

  readonly fieldData = input.required<Field>();
  readonly vocabularies = input<Map<string, object[]> | null>(null);
  readonly subVocabularies = input<Map<string, object[]> | null>(null);
  readonly editMode = input<any>(undefined);
  readonly position = input<number | null>(null);

  readonly hasChanges = output<boolean>();
  readonly handleBitSets = output<Field>();
  readonly handleBitSetsOfComposite = output<HandleBitSet>();

  form: UntypedFormGroup;
  readonly hideField = signal<boolean | null>(null);

  ngOnInit() {
    const position = this.position();
    if (position !== null) {
      // console.log(this.rootFormGroup.control.controls[this.position]);
      // console.log(this.rootFormGroup.control.controls[this.position].get(this.fieldData().name));
      this.form = this.rootFormGroup.control.controls[position].get(this.fieldData().name) as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control.get(this.fieldData().name) as UntypedFormGroup;
    }
    this.refresh(this.form);
    if (this.fieldData().typeInfo.multiplicity){
      this.chooseOne(Object.entries((this.form.controls[0] as UntypedFormGroup).controls)[0][0], 0);
    } else {
      this.chooseOne(Object.entries(this.form.controls)[0][0]);
    }
  }

  /** Choose one to show **/
  chooseOne(name: string, index?: number) {
    let tmpGroup: UntypedFormGroup;
    if (index !== undefined) {
      tmpGroup = this.form.controls[index] as UntypedFormGroup;
    } else {
      tmpGroup = this.form;
    }
    for (const control in tmpGroup.controls) {
      tmpGroup.removeControl(control);
    }
    // The name is one of this field's own sub-fields.
    const subField = this.fieldData().subFields!.find(field => field.name === name)!;
    if (subField.typeInfo.type === 'composite')
      tmpGroup.addControl(name, this.formService.createCompositeField(subField));
    else if (subField.typeInfo.type === 'string') {
      tmpGroup.addControl(name, this.formService.createField(subField));
    }
  }

  /** Handle Arrays --> **/
  fieldAsFormArray() {
    return this.form as unknown as UntypedFormArray;
  }

  getGroupOfArray(index: number) {
    return this.fieldAsFormArray().controls[index] as UntypedFormGroup;
  }

  remove(i: number) {
    this.fieldAsFormArray().removeAt(i);
  }

  pushComposite(compositeField: Field) {
    this.fieldAsFormArray().push(this.formService.createCompositeField(compositeField));
    this.chooseOne(Object.entries((this.form.controls[this.fieldAsFormArray().length - 1] as UntypedFormGroup).controls)[0][0], this.fieldAsFormArray().length - 1);
  }

  /** <-- Handle Arrays **/

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

  /** other stuff--> **/
  unsavedChangesPrompt() {
    this.hasChanges.emit(true);
  }

  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  enableDisableField(value) {
    // console.log(value);
    if (value === 'Applicable') {
      this.form.enable();
      this.hideField.set(false);

    } else {
      this.form.disable();
      this.form.reset();
      this.hideField.set(true);
      // maybe add this if the remaining empty fields are a problem
      // (this.formControl as unknown as FormArray).clear();

    }
  }
}
