import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

import {Dependent, Fields, HandleBitSet, UiVocabulary} from '../../../domain/dynamic-form-model';
import {Vocabulary} from '../../../domain/eic-model';
import {AuthenticationService} from '../../../services/authentication.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-field',
  templateUrl: './dynamic-form-fields.component.html'
})
export class DynamicFormFieldsComponent implements OnInit {
  @Input() fieldData: Fields;
  @Input() form: FormGroup;
  @Input() vocabularies: Map<string, UiVocabulary[]>;
  @Input() subVocabularies: UiVocabulary[];
  @Input() editMode: any;

  @Output() handleBitSets = new EventEmitter<Fields>();
  @Output() handleBitSetsOfComposite = new EventEmitter<HandleBitSet>();

  projectName = environment.projectName;
  isPortalAdmin = false;
  hasChanges = false;
  // bitSetData = new BitSetData();


  constructor(private authenticationService: AuthenticationService,) { }

  ngOnInit() {
    this.isPortalAdmin = this.authenticationService.isAdmin();
  }

  /** Handle Arrays --> **/
  fieldAsFormArray(field: string) {
    return this.form.get(field) as FormArray;
  }

  push(field: string, required: boolean) {
    this.fieldAsFormArray(field).push(required ? new FormControl('', Validators.required) : new FormControl(''));
  }

  remove(field: string, i: number) {
    this.fieldAsFormArray(field).removeAt(i);
  }

  pushComposite(field: string, subFields: Fields[]) {
    const group: any = {};
    subFields.forEach(subField => {
      group[subField.field.name] = subField.field.form.mandatory ? new FormControl('', Validators.required)
        : new FormControl('');
      if (subField.field.form.dependsOn !== null) {
        group[subField.field.name].disable();
      }
    });
    this.fieldAsFormArray(field).push(new FormGroup(group));
  }

  // onCompositeChange(field: string, affects: Dependent[], index?: number) {
  onCompositeChange(fieldData: Fields, j?: number, i?: number) {
    // fieldData.subFieldGroups[j].field.parent, fieldData.subFieldGroups[j].field.form.affects
    if (fieldData.subFieldGroups[j].field.form.affects !== null ) {
      fieldData.subFieldGroups[j].field.form.affects.forEach( f => {
        this.fieldAsFormArray(fieldData.subFieldGroups[j].field.parent).controls[i].get(f.name).reset();
        this.fieldAsFormArray(fieldData.subFieldGroups[j].field.parent).controls[i].get(f.name).enable();
        // this.updateBitSetOfGroup(fieldData, i, f.name, f.id.toString());
      });
    }
  }

  /** <-- Handle Arrays **/

  /** check form fields and tabs validity--> **/

  checkFormValidity(name: string, edit: boolean): boolean {
    return (!this.form.get(name).valid && (edit || this.form.get(name).dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    if (groupName) {
      return (!this.fieldAsFormArray(name).get([position]).get(groupName).valid
        && (edit || this.fieldAsFormArray(name).get([position]).get(groupName).dirty));
    }
    return (!this.fieldAsFormArray(name).get([position]).valid
      && (edit || this.fieldAsFormArray(name).get([position]).dirty));
  }

  /** <-- check form fields and tabs validity **/

  /** Return Vocabulary items for composite fields--> **/

  getCompositeVocabularyItems(fieldData: Fields, j: number, i?: number) {
    if (fieldData.subFieldGroups[j].field.form.dependsOn !== null) {
      return this.subVocabularies[this.fieldAsFormArray(fieldData.subFieldGroups[j].field.parent).controls[i].get(fieldData.subFieldGroups[j].field.form.dependsOn.name).value];
    } else {
      return this.vocabularies[fieldData.subFieldGroups[j].field.form.vocabulary];
    }
  }

  /** <--Return Vocabulary items for composite fields **/

  updateBitSet(fieldData: Fields) {
    if (fieldData.field.form.mandatory) {
      this.handleBitSets.emit(fieldData);
    }
  }

  updateBitSetOfComposite(fieldData: Fields, position: number) {
    if (fieldData.field.form.mandatory) {
      let tmp = new HandleBitSet();
      tmp.field = fieldData;
      tmp.position = position;
      this.handleBitSetsOfComposite.emit(tmp);
    }
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

}
