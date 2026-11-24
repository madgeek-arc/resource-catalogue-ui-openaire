import { Component, OnInit, ChangeDetectionStrategy, inject, input, output, signal, DestroyRef } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {formFieldRefresher} from '../../../../shared/form-refresh';
import {Field, HandleBitSet} from '../../../../domain/dynamic-form-model';
import { UntypedFormControl, UntypedFormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-radio-button-field',
    templateUrl: './radio-button-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule]
})

export class RadioButtonFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);
  /** Refreshes this field when its controls change, whoever changes them. */
  private readonly refresh = formFieldRefresher();
  private destroyRef = inject(DestroyRef);


  readonly fieldData = input.required<Field>();
  readonly editMode = input(false);
  readonly readonly = input<boolean | null>(null);
  readonly position = input<number | null>(null);

  readonly hasChanges = output<boolean>();
  readonly handleBitSets = output<Field>();
  readonly handleBitSetsOfComposite = output<HandleBitSet>();

  formControl!: UntypedFormControl;
  form!: UntypedFormGroup;
  readonly hideField = signal<boolean | null>(null);

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
    if (this.formControl.value) this.formControl.setValue(this.formControl.value.toString());
    // console.log(this.formControl);
    const dependsOn = this.fieldData().form.dependsOn;
    if (dependsOn) {
      // console.log(this.fieldData().form.dependsOn);
      this.enableDisableField(this.form.get(dependsOn.name)!.value, dependsOn.value);
      // console.log(this.fieldData().name);
      this.form.get(dependsOn.name)!.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        this.enableDisableField(value, dependsOn.value);
      }, error => {console.log(error);});
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
  enableDisableField(value: unknown, enableValue: string | null) {

    if (value === enableValue) {
      this.formControl.enable();
      this.hideField.set(false);

    } else {
      this.formControl.disable();
      this.formControl.reset();
      this.hideField.set(true);
    }

  }

  unsavedChangesPrompt() {
    this.hasChanges.emit(true);
  }

  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
