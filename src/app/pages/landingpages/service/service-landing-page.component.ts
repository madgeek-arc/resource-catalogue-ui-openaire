import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Provider} from '../../../entities/eic-model';
import {ResourceService} from '../../../services/resource.service';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {environment} from 'src/environments/environment';
import {Fields, FormModel, UiVocabulary} from '../../../entities/dynamic-form-model';
import {PremiumSortPipe} from '../../../shared/pipes/premium-sort.pipe';

@Component({
  selector: 'app-service-landing-page',
  templateUrl: './service-static-landing-page.component.html',
  // styleUrls: ['../landing-page.component.css']
})
export class ServiceLandingPageComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  projectName = environment.projectName;
  vocabularies: Map<string, UiVocabulary[]>;
  model: FormModel[] = null;
  form: FormGroup = this.fb.group({service: this.fb.group({}), extras: this.fb.group({})}, Validators.required);
  id: string;
  ready = false;

  premiumSort = new PremiumSortPipe();
  path: string;
  myProviders:  Provider[] = [];
  canAddOrEditService = false;

  relatedServices: Object = null;
  resourcePayload: Object = null;

  constructor(public route: ActivatedRoute, public resourceService: ResourceService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.ready = false;

    this.subscriptions.push(
      this.route.params.subscribe(
        params => {

          this.id = params['id'];
          console.log(this.id)
          this.subscriptions.push(
            this.resourceService.getResource(this.id).subscribe(
              next => {this.resourcePayload = next;},
              error => {console.log(error);},
            () => {this.ready = true}
            )
          );
        }
      )
    );

    // this.sub = this.route.params.subscribe(params => {
    //   zip(
    //     this.formService.getFormModel(),
    //     this.formService.getDynamicService(params['id']),
    //     this.formService.getUiVocabularies(),
    //   ).subscribe(suc => {
    //       this.model = <FormModel[]>suc[0];
    //       this.vocabularies = <Map<string, UiVocabulary[]>>suc[2];
    //       this.initializations();
    //       ResourceService.removeNulls(suc[1]['service']);
    //       ResourceService.removeNulls(suc[1]['extras']);
    //       this.prepareForm(suc[1]);
    //       this.form.patchValue(suc[1]);
    //       if (this.form.get('extras.relatedServices').value.length > 0 && this.form.get('extras.relatedServices').value[0] !== '') {
    //         this.resourceService.getSomeSnippets(this.form.get('extras.relatedServices').value).subscribe(
    //           res => { this.relatedServices = res; },
    //           error => { console.log(error); },
    //           () => { this.loading = false; }
    //         );
    //       }
    //     },
    //     err => {
    //       if (err.status === 404) {
    //         this.router.navigate(['/404']);
    //       }
    //       this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
    //     },
    //     () => {
    //       if (this.authenticationService.isLoggedIn()) {
    //         this.matomoTracker.trackEvent('Recommendations', this.authenticationService.getUserEmail() + ' ' + this.serviceId, 'visit', 1);
    //       }
    //       if (this.form.get('extras.relatedServices').value.length === 1 && this.form.get('extras.relatedServices').value[0] === '') {
    //         this.loading = false;
    //       }
    //     });
    //
    //   if (this.authenticationService.isLoggedIn()) {
    //     this.resourceService.getMyServiceProviders().subscribe(
    //       res => this.myProviders = res,
    //       er => console.log(er),
    //       () => {
    //         this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire');
    //         console.log(this.canAddOrEditService);
    //         console.log(this.myProviders);
    //       }
    //     );
    //   }
    //   this.id = params['id'];
    // });
  }

  ngOnDestroy(): void {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onOutletLoaded(component) {
    if (!this.ready) {
      this.timeOut(300).then(() => this.onOutletLoaded(component));
      return;
    } else {
      component.form = this.form;
      component.model = this.model;
      component.vocabularies = this.vocabularies;
      component.relatedServices = this.relatedServices;
    }
    if (window.location.toString().includes('overview')) {
      this.path = 'overview';
    } else if (window.location.toString().includes('pricing')) {
      this.path = 'pricing';
    } else if (window.location.toString().includes('resourcesAndSupport')) {
      this.path = 'resourcesAndSupport';
    } else if (window.location.toString().includes('miscellaneous')) {
      this.path = 'miscellaneous';
    }

    return;
  }

  initializations() {
    /** Create form **/
    const tmpForm: any = {};
    // tmpForm['service'] = this.formService.toFormGroup(this.model, true);
    // tmpForm['extras'] = this.formService.toFormGroup(this.model, false);
    this.form = this.fb.group(tmpForm);

    /** Initialize and sort vocabulary arrays **/
    // let voc: Vocabulary[] = this.vocabularies['Subcategory'].concat(this.vocabularies['Scientific subdomain']);
    // this.subVocabularies = this.groupByKey(voc, 'parentId');
    for (const [key, value] of Object.entries(this.vocabularies)) {
      this.premiumSort.transform(this.vocabularies[key], ['English', 'Europe', 'Worldwide']);
    }
  }

  prepareForm(form: Object) {
    for (const key in form) {
      for (const formElementKey in form[key]) {
        if (form[key].hasOwnProperty(formElementKey)) {
          if (Array.isArray(form[key][formElementKey])) {
            // console.log(form[key][formElementKey]);
            // console.log(formElementKey);
            const formFieldData = this.getModelData(this.model, formElementKey);
            let i = 1;
            if (formFieldData.field.type === 'composite') { // In order for the fields to be enabled
              this.popComposite(key, formElementKey);  // remove it first
              i = 0;  // increase the loops
            }
            let count = 0;
            for (i; i < form[key][formElementKey].length; i++) {
              if (formFieldData.field.type === 'composite') {
                this.pushComposite(key, formElementKey, formFieldData.subFieldGroups);
                // for (let formSubElementKey in form[key][formElementKey]) { // Special case when composite contains array
                for (const formSubElementName in form[key][formElementKey][count]) {
                  if (form[key][formElementKey][count].hasOwnProperty(formSubElementName)) {
                    if (Array.isArray(form[key][formElementKey][count][formSubElementName])) {
                      // console.log('Key: ' + key + ' formElementKey: ' + formElementKey + ' count: ' + count + ' formSubElementName: ' + formSubElementName);
                      const control = <FormArray>this.form.get([key, formElementKey, count, formSubElementName]);
                      // console.log(control);
                      let required = false;
                      for (let j = 0; j < formFieldData.subFieldGroups.length; j++) {
                        if (formFieldData.subFieldGroups[j].field.name === formSubElementName) {
                          required = formFieldData.subFieldGroups[j].field.form.mandatory;
                        }
                      }
                      for (let j = 0; j < form[key][formElementKey][count][formSubElementName].length - 1; j++) {
                        control.push(required ? new FormControl('', Validators.required) : new FormControl(''));
                      }
                    }
                  }
                }
                // }
                count++;
              } else {
                this.push(key, formElementKey, formFieldData.field.form.mandatory);
              }
            }
          }
        }
      }
    }
  }

  push(group: string, field: string, required: boolean) {
    // console.log('group: ' + group + ' field: ' + field);
    const tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.push(required ? new FormControl('', Validators.required) : new FormControl(''));
  }

  pushComposite(group: string, field: string, subFields: Fields[]) {
    const formGroup: any = {};
    subFields.forEach(subField => {
      if (subField.field.multiplicity) {
        formGroup[subField.field.name] = subField.field.form.mandatory ?
          new FormArray([new FormControl('', Validators.required)])
          : new FormArray([new FormControl('')]);
      } else {
        formGroup[subField.field.name] = subField.field.form.mandatory ? new FormControl('', Validators.required)
          : new FormControl('');
      }
    });
    // console.log('group: ' + group + ' field: ' + field);
    const tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.push(new FormGroup(formGroup));
  }

  popComposite(group: string, field: string) {
    // console.log('group: ' + group + ' field: ' + field);
    const tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.removeAt(0);
  }

  getModelData(model: FormModel[], name: string): Fields {
    for (let i = 0; i < model.length; i++) {
      for (let j = 0; j < model[i].fields.length; j++) {
        if (model[i].fields[j].field.name === name) {
          return model[i].fields[j];
        }
      }
    }
  }

  goto(url: string) {
    window.open(url, '_blank');
  }

}
