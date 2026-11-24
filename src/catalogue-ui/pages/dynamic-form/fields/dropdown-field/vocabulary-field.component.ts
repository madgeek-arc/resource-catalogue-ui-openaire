import { Component, OnInit, ChangeDetectionStrategy, inject, input, output, DestroyRef, signal } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {formFieldRefresher} from '../../../../shared/form-refresh';
import {Field, HandleBitSet, vocabularyName, VocabularyLookup} from '../../../../domain/dynamic-form-model';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormGroupDirective, Validators, ReactiveFormsModule } from '@angular/forms';
import {FormControlService} from '../../../../services/form-control.service';
import {URLValidator} from '../../../../shared/validators/generic.validator';
import {ActivatedRoute} from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
    selector: 'app-vocabulary-field',
    templateUrl: './vocabulary-field.component.html',
    styleUrls: ['./vocabulary-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, NgSelectComponent]
})

export class VocabularyFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);
  /** Refreshes this field when its controls change, whoever changes them. */
  private readonly refresh = formFieldRefresher();
  private destroyRef = inject(DestroyRef);
  private formControlService = inject(FormControlService);
  private route = inject(ActivatedRoute);

  readonly fieldData = input.required<Field>();
  readonly vocabularies = input<VocabularyLookup | null>(null);
  readonly subVocabularies = input<VocabularyLookup | null>(null);
  readonly editMode = input<any>(undefined);
  readonly position = input<number | null>(null);

  readonly hasChanges = output<boolean>();
  readonly handleBitSets = output<Field>();
  readonly handleBitSetsOfComposite = output<HandleBitSet>();

  formControl!: UntypedFormControl;
  form!: UntypedFormGroup;

  /** The options of a field that depends on another: the sub-vocabulary of the value picked there. */
  readonly dynamicVoc = signal<object[]>([]);
  /** Key of this field's options in `vocabularies`. */
  vocabularyKey: string | null = null;

  ngOnInit() {
    const position = this.position();
    if (position !== null) {
      this.form = this.rootFormGroup.control.controls[position] as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control;
    }
    this.formControl = this.form.get(this.fieldData().name) as UntypedFormControl;
    this.refresh(this.formControl);
    this.vocabularyKey = vocabularyName(this.fieldData().typeInfo);

    if(this.fieldData().name === 'resourceOrganisation' && this.route.snapshot.paramMap.get('providerId')!==null){
        this.form.get('resourceOrganisation')!.setValue(this.route.snapshot.paramMap.get('providerId'));
    }

    const dependsOn = this.fieldData().form.dependsOn;
    if (dependsOn) {
      // console.log(this.fieldData().form.dependsOn);
      this.enableDisableField(this.form.get(dependsOn.name)!.value);

      this.form.get(dependsOn.name)!.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        this.enableDisableField(value);
      });
    }
    // console.log(this.vocabularies[this.fieldData().typeInfo.vocabulary]);
    // console.log(this.fieldData().name);
    // console.log(this.formControl);
  }

  /** Handle Arrays --> **/

  fieldAsFormArray() {
    return this.formControl as unknown as UntypedFormArray;
  }

  push(field: string, required: boolean, type: string) {
    switch (type) {
      case 'url':
        this.fieldAsFormArray().push(required ? new UntypedFormControl('', Validators.compose([Validators.required, URLValidator]))
          : new UntypedFormControl('', URLValidator));
        break;
      default:
        this.fieldAsFormArray().push(required ? new UntypedFormControl('', Validators.required) : new UntypedFormControl(''));
    }
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

  /** value is the form value of the field this one depends on: a vocabulary id, or empty. */
  enableDisableField(value: string | null) {
    this.dynamicVoc.set([]);
    // Only called for a field that depends on another.
    const dependsOn = this.fieldData().form.dependsOn!;

    if (dependsOn.value) {
      if (value === dependsOn.value) {
        this.formControl.enable();
      } else {
        this.formControl.disable();
        this.formControl.reset();
      }
    } else if (value) {
      this.dynamicVoc.set(this.subVocabularies()![value]);
      this.formControl.enable();
    } else {
      this.formControl.disable();
      this.formControl.reset();
    }
  }

}
