import { Component, OnInit, ChangeDetectionStrategy, inject, input, output, signal, DestroyRef } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {formFieldRefresher} from '../../../../shared/form-refresh';
import {Field, HandleBitSet, UiVocabulary} from '../../../../domain/dynamic-form-model';
import { UntypedFormArray, FormControl, UntypedFormGroup, FormGroupDirective, Validators, ReactiveFormsModule } from '@angular/forms';
import {FormControlService} from '../../../../services/form-control.service';
import { ReadMoreTextComponent } from '../../../../shared/reusable-components/read-more.component';
import { ChooseOneComponent } from '../choose-one-composite/choose-one.component';
import { VocabularyFieldComponent } from '../dropdown-field/vocabulary-field.component';
import { StringFieldComponent } from '../string-field/string-field.component';
import { NumberFieldComponent } from '../number-field/number-field.component';
import { CheckboxFieldComponent } from '../checkbox-field/checkbox-field.component';
import { LargeTextFieldComponent } from '../large-text-field/large-text-field.component';
import { RadioButtonFieldComponent } from '../radio-button-field/radio-button-field.component';
import { RichTextFieldComponent } from '../rich-text-field/rich-text-field.component';
import { DateFieldComponent } from '../date-field/date-field.component';
import { RadioGridFieldComponent } from '../radio-grid-field/radio-grid-field.component';

@Component({
    selector: 'app-composite-field',
    templateUrl: './composite-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, ReadMoreTextComponent, ChooseOneComponent, VocabularyFieldComponent, StringFieldComponent, NumberFieldComponent, CheckboxFieldComponent, LargeTextFieldComponent, RadioButtonFieldComponent, RichTextFieldComponent, DateFieldComponent, RadioGridFieldComponent]
})

export class CompositeFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);
  /** Refreshes this field when its controls change, whoever changes them. */
  private readonly refresh = formFieldRefresher();
  private destroyRef = inject(DestroyRef);
  private formService = inject(FormControlService);

  readonly fieldData = input.required<Field>();
  readonly vocabularies = input<Map<string, object[]> | null>(null);
  readonly subVocabularies = input<Map<string, object[]> | null>(null);
  readonly editMode = input<any>(undefined);
  readonly readonly = input<boolean | null>(null);
  readonly position = input<number | null>(null);

  readonly hasChanges = output<boolean>();
  readonly handleBitSets = output<Field>();
  readonly handleBitSetsOfComposite = output<HandleBitSet>();

  form: UntypedFormGroup;
  readonly hideField = signal<boolean | null>(null);

  ngOnInit() {
    // console.log(this.fieldData().name);
    const position = this.position();
    if (position !== null) {
      // console.log(this.rootFormGroup.control.controls[this.position]);
      // console.log(this.rootFormGroup.control.controls[this.position].get(this.fieldData().name));
      this.form = this.rootFormGroup.control.controls[position].get(this.fieldData().name) as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control.get(this.fieldData().name) as UntypedFormGroup;
      // console.log(this.form);
    }
    this.refresh(this.form);
    // console.log(this.form);
    const dependsOn = this.fieldData().form.dependsOn;
    if (dependsOn) { // specific changes for composite field, maybe revise it
      this.enableDisableField(this.rootFormGroup.form.get(dependsOn.name)!.value);

      this.rootFormGroup.form.get(dependsOn.name)!.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        this.enableDisableField(value);
      });
    }
  }

  /** Handle Arrays --> **/
  fieldAsFormArray() {
    return this.form as unknown as UntypedFormArray;
  }

  oldFieldAsFormArray(field: string) {
    return this.form.get(field) as UntypedFormArray;
  }

  remove(i: number) {
    this.fieldAsFormArray().removeAt(i);
  }

  pushComposite(compositeField: Field) {
    this.fieldAsFormArray().push(this.formService.createCompositeField(compositeField));
  }

  movedElement(e, ) {
    const newOrder: number[] = [];
    e.target.childNodes.forEach(child => {
      newOrder.push(child.id);
    });
    // console.log(newOrder);
    for (let i = 0; i < newOrder.length-1; i++) {
      if (newOrder[i] != i) {
        if (newOrder[i] > i+1) {
          this.move(newOrder[i], i);
          break;
        } else if (newOrder[i] < i) {
          this.move(i, newOrder[i]);
          break;
        }
      }
    }
  }

  move(newIndex: number, currentIndex: number) {
    const formArray = this.fieldAsFormArray();

    const currentGroup = formArray.at(currentIndex);
    formArray.removeAt(currentIndex);
    formArray.insert(newIndex, currentGroup);
  }

  /** <-- Handle Arrays **/

  /** check form fields and tabs validity--> **/

  checkFormValidity(name: string, edit: boolean): boolean {
    return (!this.form.get(name)!.valid && (edit || this.form.get(name)!.dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    if (groupName) {
      return !!(!this.oldFieldAsFormArray(name)?.get([position])?.get(groupName)!.valid
        && (edit || this.oldFieldAsFormArray(name)?.get([position])?.get(groupName)!.dirty));

    }
    return (!this.oldFieldAsFormArray(name).get([position])!.valid
      && (edit || this.oldFieldAsFormArray(name).get([position])!.dirty));
  }

  /** <-- check form fields and tabs validity **/

  /** Handle Bitsets--> **/

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
    if (value === 'Applicable' || value === 'Yes') {
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
