import {Component, OnChanges, OnInit} from '@angular/core';
import {FormControlService} from './form-control.service';
import {DynamicFormComponent} from './dynamic-form.component';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Fields, FormModel, HandleBitSet} from '../../../domain/dynamic-form-model';
import get = Reflect.get;
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';

@Component({
  selector: 'app-dynamic-form-edit',
  templateUrl: './dynamic-form.component.html',
  providers: [FormControlService]
})
export class DynamicFormEditComponent extends DynamicFormComponent {

  private sub: Subscription;
  serviceID: string;

  constructor(public route: ActivatedRoute,
              protected formControlService: FormControlService,
              protected fb: FormBuilder,
              protected router: NavigationService) {
    super(formControlService, fb, router);
  }

  ngOnInit() {
    this.editMode = true;
    super.ngOnInit();
    this.sub = this.route.params.subscribe(params => {
      this.serviceID = params['id'];
      this.formControlService.getDynamicService(this.serviceID).subscribe(
        res => {
          ResourceService.removeNulls(res['service']);
          ResourceService.removeNulls(res['extras']);
          this.prepareForm(res);
          this.form.patchValue(res)
          this.validateForm();
        }, error => console.log('error'),
      );
    });
  }

  // onSubmit(tempSave: boolean, pendingService?: boolean) {
  //   console.log('boom')
  //   super.onSubmit(tempSave, pendingService);
  // }

  prepareForm(form: Object) {
    for (let key in form) {
      for (let formElementKey in form[key]) {
        if(form[key].hasOwnProperty(formElementKey)) {
          if(Array.isArray(form[key][formElementKey])) {
            // console.log(form[key][formElementKey]);
            // console.log(formElementKey);
            let formFieldData = this.getModelData(this.fields, formElementKey);
            let i = 1;
            if (formFieldData.field.type === 'composite') { // In order for the fields to be enabled
              this.popComposite(key, formElementKey)  // remove it first
              i = 0;  // increase the loops
            }
            for (i; i < form[key][formElementKey].length; i++) {
              if (formFieldData.field.type === 'composite') {
                this.pushComposite(key, formElementKey, formFieldData.subFieldGroups);
              } else {
                this.push(key, formElementKey, formFieldData.field.form.mandatory);
              }
            }
          }
        }
      }
    }
  }

  validateForm() {
    for (let control in this.form.controls) {
      // console.log(control);
      let tmp = this.form.controls[control] as FormGroup;
      for (let key in tmp.controls) {
        let formFieldData = this.getModelData(this.fields, key);
        if (formFieldData.field.form.mandatory){
          // console.log(key);
          if (formFieldData.field.type === 'composite') {
            // console.log('composite: ' + key);
            for (let i = 0; i < formFieldData.subFieldGroups.length; i++) {
              if (formFieldData.subFieldGroups[i].field.form.mandatory) {
                let data = new HandleBitSet();
                data.field = formFieldData;
                data.position = i;
                this.handleBitSetOfComposite(data);
              }
            }
          } else {
            this.handleBitSet(formFieldData);
          }
        }

        if (Array.isArray(tmp.controls[key].value)) {

        }
      }
    }
  }

  push(group: string, field: string, required: boolean) {
    let tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.push(required ? new FormControl('', Validators.required) : new FormControl(''));
  }

  pushComposite(group: string, field: string, subFields: Fields[]) {
    const formGroup: any = {};
    subFields.forEach(subField => {
      formGroup[subField.field.name] = subField.field.form.mandatory ? new FormControl('', Validators.required)
        : new FormControl('');
      // In this case fields must be enabled
      // if (subField.field.form.dependsOn !== null) {
      //   formGroup[subField.field.name].disable();
      // }
    });
    let tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.push(new FormGroup(formGroup));
  }

  popComposite(group: string, field: string) {
    let tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.removeAt(0);
  }

  getModelData(model: FormModel[], name: string): Fields {
    for (let i = 0; i < model.length; i++) {
      for (let j = 0; j < model[i].fields.length; j++) {
        if(model[i].fields[j].field.name === name) {
          return model[i].fields[j];
        }
      }
    }
  }

}
