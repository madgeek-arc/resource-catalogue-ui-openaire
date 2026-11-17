import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import {Field, HandleBitSet} from '../../../../domain/dynamic-form-model';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-large-text-field',
    templateUrl: './large-text-field.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, NgClass]
})

export class LargeTextFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);

  @Input() fieldData: Field;
  readonly editMode = input<any>(undefined);
  readonly readonly = input<boolean>(null);
  readonly position = input<number>(null);

  @Output() hasChanges = new EventEmitter<boolean>();
  @Output() handleBitSets = new EventEmitter<Field>();
  @Output() handleBitSetsOfComposite = new EventEmitter<HandleBitSet>();

  formControl!: UntypedFormControl;
  form!: UntypedFormGroup;
  hideField: boolean = null;

  ngOnInit() {
    const position = this.position();
    if (position !== null) {
      this.form = this.rootFormGroup.control.controls[position] as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control;
    }
    // console.log(this.form);

    this.formControl = this.form.get(this.fieldData.name) as UntypedFormControl;
    // console.log(this.formControl);

    if(this.fieldData.form.dependsOn) {
      // console.log(this.fieldData.form.dependsOn);
      this.enableDisableField(this.form.get(this.fieldData.form.dependsOn.name).value, this.fieldData.form.dependsOn.value);

      this.form.get(this.fieldData.form.dependsOn.name).valueChanges.subscribe(
        value => {
          this.enableDisableField(value, this.fieldData.form.dependsOn.value);
        },
        error => {console.log(error);}
      );
    }
  }

  /** check fields validity--> **/

  checkFormValidity(): boolean {
    return (!this.formControl.valid && (this.formControl.touched || this.formControl.dirty));
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

  enableDisableField(value, enableValue) {
    if (value?.toString() == enableValue) {
      this.formControl.enable();
      this.hideField = false;
    } else {
      this.formControl.disable();
      this.formControl.reset();
      this.hideField = true;
      // maybe add this if the remaining empty fields are a problem
      // (this.formControl as unknown as FormArray).clear();
    }
  }

}


