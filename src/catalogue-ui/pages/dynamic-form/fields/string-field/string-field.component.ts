import { Component, OnInit, ChangeDetectionStrategy, inject, input, output, signal, DestroyRef } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {formFieldRefresher} from '../../../../shared/form-refresh';
import {Field, HandleBitSet} from '../../../../domain/dynamic-form-model';
import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import {FormControlService} from '../../../../services/form-control.service';
import { SafeUrlPipe } from '../../../../shared/pipes/safeUrlPipe';

@Component({
    selector: 'app-string-url-email-field',
    templateUrl: './string-field.component.html',
    styles: ['.clear-style { height: 0 !important;}'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, SafeUrlPipe]
})

export class StringFieldComponent implements OnInit {
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

      this.form.get(dependsOn.name)!.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        value => {
            this.enableDisableField(value, dependsOn.value);
          },
        error => {console.log(error);}
      );
    }

    // console.log(this.fieldData());
    // console.log(this.form);
    // console.log(this.formControl);
  }

  /** Handle Arrays --> **/

  fieldAsFormArray() {
    return this.formControl as unknown as UntypedFormArray;
  }

  push() {
    this.fieldAsFormArray().push(this.formControlService.createField(this.fieldData()));
  }

  remove(field: string, i: number) {
    this.fieldAsFormArray().removeAt(i);
  }

  movedElement(e) {
    const newOrder: number[] = [];
    e.target.childNodes.forEach(child => {
      if (Number.isInteger((parseInt(child.id))))
        newOrder.push(child.id);
    });
    for (let i = 0; i < newOrder.length; i++) {
      if (newOrder[i] != i && (newOrder[i] > i+1 || newOrder[i] < i)) {
        this.move(i, newOrder[i]);
        break;
      }
    }
  }

  move(newIndex: number, currentIndex: number) {
    const formArray: UntypedFormArray = this.fieldAsFormArray();
    const currentControl: AbstractControl = formArray.at(currentIndex);

    formArray.removeAt(currentIndex);
    formArray.insert(newIndex, currentControl);
  }

  /** check fields validity--> **/

  checkFormValidity(): boolean {
    return (!this.formControl.valid && (this.formControl.touched || this.formControl.dirty));
  }

  checkFormArrayValidity(position: number): boolean {
    const formControl: AbstractControl | null = this.fieldAsFormArray()?.get([position]) ?? null;
    // console.log(formControl);
    // console.log(position);
    if (formControl)
      return (!formControl.valid && (formControl.touched || formControl.dirty));
    else
      return false;

    // return ((this.fieldAsFormArray().get([position]).invalid && this.fieldAsFormArray().get([position]).touched)
    //   && (this.editMode || this.fieldAsFormArray().get([position]).dirty));
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
    // console.log('string-field.component emitting to parent->');
    this.hasChanges.emit(true);
  }

  enableDisableField(value, enableValue) {
    if (value?.toString() == enableValue) {
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

  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
