import { Component, OnInit, ChangeDetectionStrategy, inject, input, output, signal, DestroyRef } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {formFieldRefresher} from '../../../../shared/form-refresh';
import {Field, HandleBitSet} from '../../../../domain/dynamic-form-model';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import {FormControlService} from '../../../../services/form-control.service';

@Component({
    selector: 'app-number-field',
    templateUrl: './number-field.component.html',
    styles: ['.clear-style { height: 0 !important;}'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule]
})

export class NumberFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);
  /** Refreshes this field when its controls change, whoever changes them. */
  private readonly refresh = formFieldRefresher();
  private destroyRef = inject(DestroyRef);
  private formControlService = inject(FormControlService);

  readonly fieldData = input.required<Field>();
  readonly editMode = input(false);
  readonly position = input<number | null>(null);

  readonly hasChanges = output<boolean>();
  readonly handleBitSets = output<Field>();
  readonly handleBitSetsOfComposite = output<HandleBitSet>();

  formControl!: UntypedFormControl;
  form!: UntypedFormGroup;
  readonly hideField = signal<boolean | null>(null);

  step = '';

  ngOnInit() {
    const position = this.position();
    if (position !== null) {
      this.form = this.rootFormGroup.control.controls[position] as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control;
    }
    this.formControl = this.form.get(this.fieldData().name) as UntypedFormControl;
    this.refresh(this.formControl);

    const dependsOn = this.fieldData().form.dependsOn;
    if (dependsOn) {
      // console.log(this.fieldData().form.dependsOn);
      this.enableDisableField(this.form.get(dependsOn.name)!.value, dependsOn.value);
      // console.log(this.fieldData().name);
      this.form.get(dependsOn.name)!.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        this.enableDisableField(value, dependsOn.value);
      });
    }

    if (this.fieldData().typeInfo.values) {
      this.step = this.fieldData().typeInfo.values[0];
    }
  }

  /** Handle Arrays --> **/

  fieldAsFormArray() {
    return this.formControl as unknown as UntypedFormArray;
  }

  remove(field: string, i: number) {
    this.fieldAsFormArray().removeAt(i);
  }

  /** check fields validity--> **/

  checkFormValidity(): boolean {
    return !( this.formControl.valid || this.formControl.pristine);
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
    if (fieldData.form.mandatory) {
      this.handleBitSets.emit(fieldData);
    }
  }

  /** other stuff--> **/
  unsavedChangesPrompt() {
    this.hasChanges.emit(true);
  }

  getNumberOfDecimals() {
    if (this.fieldData().typeInfo.values) {
      return this.fieldData().typeInfo.values[0].split('.')[1].length;
    }
    return 0;
  }

  /** value is the form value of the field this one depends on. */
  enableDisableField(value: {toString(): string} | null | undefined, enableValue: string | null) {
    // Compares as == did: the text when both are set, and an empty field matches a null enableValue.
    if ((value?.toString() ?? null) === (enableValue ?? null)) {
      this.formControl.enable();
      this.hideField.set(false);

    } else {
      this.formControl.disable();
      this.formControl.reset();
      this.hideField.set(true);
      // maybe add this if the remaining empty fields are a problem
      // (this.formControl as unknown as FormArray).clear();

    }
  }

}
