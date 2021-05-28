import {Injectable} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';

import {FormModel} from '../../../domain/dynamic-form-model';
import {urlAsyncValidator, URLValidator} from '../../../shared/validators/generic.validator';
import {ServiceProviderService} from '../../../services/service-provider.service';

@Injectable()
export class FormControlService {
  constructor(private serviceProviderService: ServiceProviderService) {
  }

  toFormGroup(form: FormModel[]) {
    const group: any = {};
    form.forEach(groups => {
      groups.fields.forEach(formField => {
        if (formField.field.multiplicity) {
          if (formField.field.type === 'url') {
            group[formField.field.name] = formField.field.form.mandatory ?
              new FormArray([new FormControl('', [Validators.required, URLValidator, urlAsyncValidator(this.serviceProviderService)])])
              : new FormArray([new FormControl('', [URLValidator, urlAsyncValidator(this.serviceProviderService)])]);
          } else if (formField.field.type === 'composite') {
            group[formField.field.name] = formField.field.form.mandatory ? new FormArray([], Validators.required)
              : new FormArray([]);
            const subGroup: any = {};
            formField.subFieldGroups.forEach(subField => {
              subGroup[subField.field.name] = subField.field.form.mandatory ?
                new FormControl('', Validators.required)
                : new FormControl('');
              if (subField.field.form.dependsOn !== null) {
                subGroup[subField.field.name].disable();
              }
            });
            group[formField.field.name].push(new FormGroup(subGroup));
          } else {
            group[formField.field.name] = formField.field.form.mandatory ?
              new FormArray([new FormControl('', Validators.required)])
              : new FormArray([new FormControl('')]);
          }
        } else {
          if (formField.field.type === 'url') {
            group[formField.field.name] = formField.field.form.mandatory ?
              new FormControl('', [Validators.required, URLValidator, urlAsyncValidator(this.serviceProviderService)])
              : new FormControl('', [URLValidator, urlAsyncValidator(this.serviceProviderService)]);
          } else {
            group[formField.field.name] = formField.field.form.mandatory ? new FormControl('', Validators.required)
              : new FormControl('');
          }
        }
      });
    });
    return new FormGroup(group);
  }

}
