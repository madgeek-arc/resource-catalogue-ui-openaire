import { Injectable, OnInit, inject } from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Field, Model, Required, Section} from '../domain/dynamic-form-model';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {urlRegEx} from '../shared/validators/generic.validator';
import {Paging} from '../domain/paging';

@Injectable()
export class FormControlService implements OnInit{
  http = inject(HttpClient);


  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};
  urlRegEx = urlRegEx;
  numbersOfDecimals = '1';
  numberRegEx = `^(\\d)*(\\.)?([0-9]{${this.numbersOfDecimals}})?$`;
  // numberRegEx = `^[0-9]*[\\.]?[0-9]{${this.numbersOfDecimals}}?$`;

  ngOnInit() {
  }

  getFormModelById(id: string) {
    return this.http.get<Model>(this.base + `/forms/models/${id}`);
  }

  /** On /form the type is null, which the request sends as "null", as before. */
  getFormModelByResourceType(type: string | null) {
    return this.http.get<Paging<Model>>(this.base + `/forms/models?resourceType=${type}`);
  }

  getFormModelByName(name: string) {
    return this.http.get<Paging<Model>>(this.base + `/forms/models?name=${name}`);
  }

  postItem(surveyId: string, item: Record<string, unknown>, edit: boolean) {
    return this.http[edit ? 'put' : 'post'](this.base + `/answers/${surveyId}/answer`, item, this.options);
  }

  /** item is the survey's form value: one group, named after the model's section, holding the resource. */
  postGenericItem(resourceType: string, item: Record<string, unknown>, edit: boolean) {
    // console.log(item[Object.keys(item)[0]]);
    return this.http.post(this.base + `/items?resourceType=${resourceType}`, item[Object.keys(item)[0]]);
  }

  validateUrl(url: string) {
    // console.log(`knocking on: ${this.base}/provider/validateUrl?urlForValidation=${url}`);
    return this.http.get<boolean>(this.base + `/provider/validateUrl?urlForValidation=${url}`);
  }

  toFormGroup(form: Section[], checkImmutable: boolean) {
    const group: Record<string, AbstractControl> = {};
    form.forEach(groups => {
      groups.fields.sort((a, b) => a.form.display?.order - b.form.display?.order);
      groups.required = new Required();
      groups.fields.forEach(formField => {
        if (formField.form.mandatory) {
          groups.required.topLevel++;
          groups.required.total++;
        }
        // if (formField.form.immutable === checkImmutable) {
          if (formField.typeInfo.multiplicity) {
            if (formField.typeInfo.type === 'url') {
              group[formField.name] = formField.form.mandatory ?
                new UntypedFormArray([new UntypedFormControl(null, Validators.compose([Validators.required, Validators.pattern(this.urlRegEx)]))])
                : new UntypedFormArray([new UntypedFormControl(null, Validators.pattern(this.urlRegEx))]);
            } else if (formField.typeInfo.type === 'composite' || formField.typeInfo.type === 'chooseOne') {
              const list = formField.form.mandatory ? new UntypedFormArray([], Validators.required)
                : new UntypedFormArray([]);
              list.push(this.createCompositeField(formField));
              group[formField.name] = list;
            } else {
              group[formField.name] = formField.form.mandatory ?
                new UntypedFormArray([new UntypedFormControl(null, Validators.required)])
                : new UntypedFormArray([new UntypedFormControl(null)]);
            }
          } else {
            if (formField.typeInfo.type === 'url') {
              group[formField.name] = formField.form.mandatory ?
              new UntypedFormControl(null, [Validators.required, Validators.pattern(this.urlRegEx)])
                : new UntypedFormControl(null, Validators.pattern(this.urlRegEx));
            } else if (formField.typeInfo.type === 'composite' || formField.typeInfo.type === 'chooseOne') {
              if (group.hasOwnProperty(formField.name)) { // merge the controls to one formGroup
                (group[formField.name] as UntypedFormGroup).controls = {...(group[formField.name] as UntypedFormGroup).controls, ...this.createCompositeField(formField).controls};
              } else
                group[formField.name] = this.createCompositeField(formField);
            } else if (formField.typeInfo.type === 'email') {
              group[formField.name] = formField.form.mandatory ?
                new UntypedFormControl(null, Validators.compose([Validators.required, Validators.email]))
                : new UntypedFormControl(null, Validators.email);
            } else if (formField.typeInfo.type === 'phone') {
              group[formField.name] = formField.form.mandatory ?
                new UntypedFormControl(null, Validators.compose([Validators.required, Validators.pattern('[+]?\\d+$')]))
                : new UntypedFormControl(null, Validators.pattern('[+]?\\d+$'));
            } else if (formField.typeInfo.type === 'number') {
              // if (formField.typeInfo.values) {
                this.numberRegEx = this.calculateNumberOfDecimals(formField.typeInfo.values);
                group[formField.name] = formField.form.mandatory ?
                  new UntypedFormControl(null, Validators.compose([Validators.required, Validators.pattern(this.numberRegEx)]))
                  : new UntypedFormControl(null, Validators.compose([Validators.pattern(this.numberRegEx)]));
              // } else {
              //   group[formField.name] = formField.form.mandatory ?
              //     new FormControl(null, Validators.required) : new FormControl(null);
              // }

            } else {
              group[formField.name] = formField.form.mandatory ? new UntypedFormControl(null, Validators.required)
                : new UntypedFormControl(null);
            }
          }
        // }
      });
    });
    return new UntypedFormGroup(group);
  }

  createCompositeField(formField: Field) {
    const subGroup: Record<string, AbstractControl> = {};
    // console.log(formField);
    formField.subFields?.sort((a, b) => a.form.display?.order - b.form.display?.order);
    formField.subFields?.forEach(subField => {
      if (subField.typeInfo.type === 'composite' || subField.typeInfo.type === 'radioGrid') {
        if (subField.typeInfo.multiplicity) {
          const list = subField.form.mandatory ? new UntypedFormArray([], Validators.required)
            : new UntypedFormArray([]);
          list.push(this.createCompositeField(subField));
          subGroup[subField.name] = list;
        } else {
          subGroup[subField.name] = this.createCompositeField(subField);
        }
      } else if (subField.typeInfo.type === 'email') {
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormControl(null, Validators.compose([Validators.required, Validators.email]))
          : new UntypedFormControl(null, Validators.email);
      } else if (subField.typeInfo.type === 'phone') {
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormControl(null, Validators.compose([Validators.required, Validators.pattern('[+]?\\d+$')]))
          : new UntypedFormControl(null, Validators.pattern('[+]?\\d+$'));
      } else if (subField.typeInfo.multiplicity) { // add array inside composite element
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormArray([new UntypedFormControl(null, Validators.required)])
          : new UntypedFormArray([new UntypedFormControl(null)]);
      } else if (subField.typeInfo.type === 'url') {
        subGroup[subField.name] = subField.form.mandatory ?
        new UntypedFormControl(null, [Validators.required, Validators.pattern(this.urlRegEx)])
            : new UntypedFormControl(null, Validators.pattern(this.urlRegEx));
      } else if (subField.typeInfo.type === 'number') {
        // if (subField.typeInfo.values) {
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormControl(null, [Validators.required, Validators.pattern(this.calculateNumberOfDecimals(subField.typeInfo.values))])
          : new UntypedFormControl(null, Validators.compose([Validators.pattern(this.calculateNumberOfDecimals(subField.typeInfo.values))]));
        // } else {
        //   subGroup[subField.name] = subField.form.mandatory ?
        //     new FormControl(null, Validators.required) : new FormControl(null);
        // }
      } else {
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormControl(null, Validators.required)
          : new UntypedFormControl(null);
      }
    });
    return new UntypedFormGroup(subGroup);
  }

  createField(formField: Field): UntypedFormControl | UntypedFormGroup {
    if (formField.typeInfo.type === 'url') {
      return formField.form.mandatory ?
        new UntypedFormControl('', [Validators.required, Validators.pattern(this.urlRegEx)])
        : new UntypedFormControl('', Validators.pattern(this.urlRegEx));
    } else if (formField.typeInfo.type === 'composite' || formField.typeInfo.type === 'chooseOne') {
      return this.createCompositeField(formField);
    } else if (formField.typeInfo.type === 'email') {
      return formField.form.mandatory ?
        new UntypedFormControl('', Validators.compose([Validators.required, Validators.email]))
        : new UntypedFormControl('', Validators.email);
    } else if (formField.typeInfo.type === 'phone') {
      return formField.form.mandatory ?
        new UntypedFormControl('', Validators.compose([Validators.required, Validators.pattern('[+]?\\d+$')]))
        : new UntypedFormControl('', Validators.pattern('[+]?\\d+$'));
    } else if (formField.typeInfo.type === 'number') {
      // if (formField.typeInfo.values) {
        this.numberRegEx = this.calculateNumberOfDecimals(formField.typeInfo.values);
        return formField.form.mandatory ?
          new UntypedFormControl('', Validators.compose([Validators.required, Validators.pattern(this.numberRegEx)]))
          : new UntypedFormControl('', Validators.compose([Validators.pattern(this.numberRegEx)]));
      // } else {
      //   return formField.form.mandatory ? new FormControl('', Validators.required) : new FormControl('');
      // }

    } else {
      return new UntypedFormControl(null, Validators.required);
    }
  }

  calculateNumberOfDecimals(values: string[]): string {
    // Every branch below sets it (or throws on a value without a decimal point, as before).
    let decimals = '0';
    if (values) {
      const str = values[0].split('.');

      if (str.length > 0) {
        if (str[1].length === 1) {
          decimals = '1';
        } else if (str[1].length === 2) {
          decimals = '0,2';
        }
        decimals = `0,${str[1].length}`;
      }
    } else
      decimals = '0';

    return `^(\\d)*(\\.)?([0-9]{${decimals}})?$`;
  }

  /**
   * Removes null and empty-string values, and lists left empty, at every depth, in place.
   * A list is walked from its end, so removing an entry doesn't shift the ones still to visit,
   * and its entries are spliced out rather than deleted, which would leave holes sent as null.
   */
  static removeNulls(obj: object) {
    // Walked as JSON, by key: a list's keys are its indexes.
    const entries = obj as Record<string, unknown>;
    const isArray = obj instanceof Array;
    const keys = isArray ? Object.keys(obj).reverse() : Object.keys(obj);
    const remove = (k: string) => isArray ? obj.splice(Number(k), 1) : delete entries[k];
    for (const k of keys) {
      const value = entries[k];
      if (value === null || value === '') {
        remove(k);
      } else if (typeof value === 'object') {
        const text = value as {value?: unknown; lang?: unknown};
        if (typeof text.value !== 'undefined' && typeof text.lang !== 'undefined') {
          if (text.value === '' && text.lang === 'en') {
            text.lang = '';
          }
        }
        FormControlService.removeNulls(value);
        if (value instanceof Array && value.length === 0) {
          remove(k);
        }
      }
    }
  }

}
