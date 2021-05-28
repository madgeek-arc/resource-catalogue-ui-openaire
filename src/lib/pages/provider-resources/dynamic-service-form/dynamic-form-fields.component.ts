import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

import {Dependent, Field, Fields} from '../../../domain/dynamic-form-model';
import {Provider, Vocabulary} from '../../../domain/eic-model';
import {Paging} from '../../../domain/paging';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-form',
  templateUrl: './dynamic-form-fields.component.html'
})
export class DynamicFormFieldsComponent implements OnInit {
  @Input() fieldData: Fields;
  @Input() form: FormGroup;

  @Input() vocabularies: Map<string, Vocabulary[]>;
  @Input() providersPage: Paging<Provider>;
  @Input() resources: any;
  @Input() editMode: any;

  requiredResources: any;
  relatedResources: any;
  hasChanges = false;


  constructor() { }

  ngOnInit() {
    this.requiredResources = this.relatedResources = this.resources;
  }

  get isValid() {
    return this.form.controls[this.fieldData.field.name].valid;
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

  onCompositeChange(field: string, index: number, affects: Dependent[]) {
    if (affects !== null ) {
      affects.forEach( f => {
        this.fieldAsFormArray(field).controls[index].get(f.name).reset();
        this.fieldAsFormArray(field).controls[index].get(f.name).enable();
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

  checkEveryArrayFieldValidity(name: string, edit: boolean, groupName?: string): boolean {
    for (let i = 0; i < this.fieldAsFormArray(name).length; i++) {
      if (groupName) {
        if (!this.fieldAsFormArray(name).get([i]).get(groupName).valid
          && (edit || this.fieldAsFormArray(name).get([i]).get(groupName).dirty)) {
          return true;
        }
      } else if (!this.fieldAsFormArray(name).get([i]).valid
        && (edit || this.fieldAsFormArray(name).get([i]).dirty)) {
        return true;
      }
    }
    return false;
  }

  /** <-- check form fields and tabs validity **/

  /** Vocabulary sorting--> **/
  sortVocabulariesByName(vocabularies: Vocabulary[]): Vocabulary[] {
    return vocabularies.sort((vocabulary1, vocabulary2) => {
      if (vocabulary1.name > vocabulary2.name) {
        return 1;
      }
      if (vocabulary1.name < vocabulary2.name) {
        return -1;
      }
      return 0;
    });
  }

  getSortedChildrenCategories(childrenCategory: Vocabulary[], parentId: string) {
    return this.sortVocabulariesByName(childrenCategory.filter(entry => entry.parentId === parentId));
  }
  /** <--Vocabulary sorting **/

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

}
