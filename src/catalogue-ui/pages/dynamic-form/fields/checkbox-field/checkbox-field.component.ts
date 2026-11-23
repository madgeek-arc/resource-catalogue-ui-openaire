import { Component, OnInit, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import {formFieldRefresher} from '../../../../shared/form-refresh';
import {Field, HandleBitSet} from '../../../../domain/dynamic-form-model';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormGroupDirective, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-checkbox-field',
    templateUrl: './checkbox-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule]
})

export class CheckboxFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);
  /** Refreshes this field when its controls change, whoever changes them. */
  private readonly refresh = formFieldRefresher();

  readonly fieldData = input.required<Field>();
  readonly editMode = input<any>(undefined);
  readonly position = input<number | null>(null);

  readonly hasChanges = output<boolean>();
  readonly handleBitSets = output<Field>();
  readonly handleBitSetsOfComposite = output<HandleBitSet>();

  formControl!: UntypedFormControl;
  form!: UntypedFormGroup;

  ngOnInit() {
    // console.log(this.fieldData());
    const position = this.position();
    if (position !== null) {
      this.form = this.rootFormGroup.control.controls[position] as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control;
    }
    // console.log(this.form);

    this.formControl = this.form.get(this.fieldData().name) as UntypedFormControl;

    this.refresh(this.formControl);
    // console.log(this.formControl);
  }

  /** Handle Arrays --> **/

  fieldAsFormArray() {
    return this.formControl as unknown as UntypedFormArray;
  }

  push(field: string, required: boolean) {
    this.fieldAsFormArray().push(required ? new UntypedFormControl(null, Validators.required) : new UntypedFormControl(null));
  }

  remove(field: string, i: number) {
    this.fieldAsFormArray().removeAt(i);
  }

  /** check fields validity--> **/

  checkFormValidity(): boolean {
    return (!this.formControl.valid && (this.formControl.touched || this.formControl.dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    if (groupName) {
      return !!(!this.fieldAsFormArray()?.get([position])?.get(groupName)!.valid
        && (edit || this.fieldAsFormArray()?.get([position])?.get(groupName)!.dirty));

    }
    return (!this.fieldAsFormArray().get([position])!.valid
      && (edit || this.fieldAsFormArray().get([position])!.dirty));
  }

  /** Bitsets--> **/

  updateBitSet(fieldData: Field) {
    this.timeOut(200).then(() => { // Needed for radio buttons strange behaviour
      if (fieldData.form.mandatory) {
        this.handleBitSets.emit(fieldData);
      }
    });
  }

  /** other stuff--> **/
  unsavedChangesPrompt() {
    this.hasChanges.emit(true);
  }

  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
