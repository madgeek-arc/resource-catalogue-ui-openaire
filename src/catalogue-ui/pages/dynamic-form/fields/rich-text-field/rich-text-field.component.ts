import { Component, Input, OnInit, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import {Field, HandleBitSet} from '../../../../domain/dynamic-form-model';
import {FormControlService} from '../../../../services/form-control.service';
import { NgClass } from '@angular/common';
import { ReadMoreTextComponent } from '../../../../shared/reusable-components/read-more.component';
import {RichTextEditorComponent} from '../../../../shared/rich-text-editor/rich-text-editor.component';

@Component({
    selector: 'app-rich-text-field',
    templateUrl: './rich-text-field.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, NgClass, ReadMoreTextComponent, RichTextEditorComponent]
})

export class RichTextFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);
  private formControlService = inject(FormControlService);

  @Input() fieldData: Field;
  readonly editMode = input<any>(undefined);
  readonly position = input<number>(null);

  readonly hasChanges = output<boolean>();
  readonly handleBitSets = output<Field>();
  readonly handleBitSetsOfComposite = output<HandleBitSet>();

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
      // console.log(this.fieldData.name);
      this.form.get(this.fieldData.form.dependsOn.name).valueChanges.subscribe(
        value => {
          this.enableDisableField(value, this.fieldData.form.dependsOn.value);
        },
        error => {console.log(error);}
      );
    }
  }

  /** Handle Arrays --> **/

  fieldAsFormArray() {
    return this.formControl as unknown as UntypedFormArray;
  }

  push() {
    this.fieldAsFormArray().push(this.formControlService.createField(this.fieldData));
  }

  remove(field: string, i: number) {
    this.fieldAsFormArray().removeAt(i);
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


