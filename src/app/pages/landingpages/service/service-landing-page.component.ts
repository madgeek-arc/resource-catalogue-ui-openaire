import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {ProviderBundle, RichService, Type, Vocabulary} from 'src/lib/domain/eic-model';
import {AuthenticationService} from 'src/lib/services/authentication.service';
import {NavigationService} from 'src/lib/services/navigation.service';
import {ResourceService} from 'src/lib/services/resource.service';
import {UserService} from 'src/lib/services/user.service';
import {ServiceProviderService} from 'src/lib/services/service-provider.service';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {flatMap} from 'rxjs/operators';
import {zip} from 'rxjs/internal/observable/zip';
import {EmailService} from 'src/lib/services/email.service';
import {environment} from 'src/environments/environment';
import {MatomoTracker} from 'ngx-matomo';
import * as Highcharts from 'highcharts';
import MapModule from 'highcharts/modules/map';
import {FormControlService} from 'src/lib/pages/provider-resources/dynamic-service-form/form-control.service';
import {Fields, FormModel, UiVocabulary} from 'src/lib/domain/dynamic-form-model';
import {PremiumSortPipe} from 'src/lib/shared/pipes/premium-sort.pipe';

MapModule(Highcharts);

declare var UIkit: any;
declare var require: any;
const mapWorld = require('@highcharts/map-collection/custom/world.geo.json');
const mapEU = require('@highcharts/map-collection/custom/europe.geo.json');

@Component({
  selector: 'app-service-landing-page',
  templateUrl: './service-static-landing-page.component.html',
  styleUrls: ['../landing-page.component.css']
})
export class ServiceLandingPageComponent implements OnInit, OnDestroy {

  public projectName = environment.projectName;

  serviceORresource = environment.serviceORresource;

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart';
  services: RichService[] = [];
  public richService: RichService;
  public errorMessage: string;
  public EU: string[];
  public WW: string[];
  public serviceId;
  vocabularies: Map<string, UiVocabulary[]>;
  model: FormModel[] = null;
  form: FormGroup = this.fb.group({service: this.fb.group({}), extras: this.fb.group({})}, Validators.required);
  loading = true;
  premiumSort = new PremiumSortPipe();

  private sub: Subscription;
  weights: string[] = ['EU', 'WW'];
  serviceMapOptions: any = null;
  myProviders: ProviderBundle[] = [];
  context = '';

  formError = '';
  showForm = false;
  canEditService = false;
  canAddOrEditService = false;
  placesVocIdArray: string[] = [];
  places: Vocabulary[] = null;

  constructor(public route: ActivatedRoute,
              public router: NavigationService,
              public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public userService: UserService,
              private providerService: ServiceProviderService,
              private formService: FormControlService,
              private fb: FormBuilder,
              private matomoTracker: MatomoTracker,
              public emailService: EmailService) {
  }

  ngOnInit() {
    this.canEditService = false;
    this.loading = true;

    if (this.authenticationService.isLoggedIn()) {
      this.sub = this.route.params.subscribe(params => {
        zip(
          this.resourceService.getEU(),
          this.resourceService.getWW(),
          this.resourceService.getRichService(params['id'], params['version']),
          this.formService.getFormModel(),
          this.formService.getDynamicService(params['id']),
          this.formService.getUiVocabularies(),
          this.providerService.getMyServiceProviders(),
        ).subscribe(suc => {
            this.EU = <string[]>suc[0];
            this.WW = <string[]>suc[1];
            this.richService = <RichService>suc[2];
            this.model = <FormModel[]>suc[3];
            this.vocabularies = <Map<string, UiVocabulary[]>>suc[5];
            this.initializations();
            ResourceService.removeNulls(suc[4]['service']);
            ResourceService.removeNulls(suc[4]['extras']);
            this.prepareForm(suc[4]);
            this.form.patchValue(suc[4]);
            this.myProviders = <ProviderBundle[]>suc[6];
            this.getLocations();
            this.router.breadcrumbs = this.richService.service.name;
            this.setCountriesForService(this.richService.service.geographicalAvailabilities);

            /* check if the current user can edit the service */
            this.canEditService = this.myProviders.some(p => this.richService.service.resourceProviders.some(x => x === p.id));

            if (this.projectName === 'OpenAIRE Catalogue') {
              this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire');
            }

            // const serviceIDs = (this.richService.service.requiredResources || []).concat(this.richService.service.relatedResources || [])
            //   .filter((e, i, a) => a.indexOf(e) === i && e !== '');
            // if (serviceIDs.length > 0) {
            //   this.resourceService.getSelectedServices(serviceIDs).subscribe(
            //     services => this.services = services,
            //     err => {
            //       console.log(err.error);
            //       this.errorMessage = err.error;
            //     });
            // }
          },
          err => {
            if (err.status === 404) {
              this.router.go('/404');
            }
            this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
          },
          () => {
            this.loading = false;
            this.context = this.richService.service.description;
            this.matomoTracker.trackEvent('Recommendations', this.authenticationService.getUserEmail() + ' ' + this.serviceId, 'visit', 1);
          });
      });
    } else {
      this.sub = this.route.params.subscribe(params => {
        zip(
          this.resourceService.getEU(),
          this.resourceService.getWW(),
          this.resourceService.getRichService(params['id']),
          this.formService.getFormModel(),
          this.formService.getDynamicService(params['id']),
          this.formService.getUiVocabularies(),
        ).subscribe(suc => {
            this.EU = <string[]>suc[0];
            this.WW = <string[]>suc[1];
            this.richService = <RichService>suc[2];
            this.model = <FormModel[]>suc[3];
            this.vocabularies = suc[5];
            this.initializations();
            ResourceService.removeNulls(suc[4]['service']);
            ResourceService.removeNulls(suc[4]['extras']);
            this.prepareForm(suc[4]);
            this.form.patchValue(suc[4]);
            this.router.breadcrumbs = this.richService.service.name;
            this.setCountriesForService(this.richService.service.geographicalAvailabilities);

            // const serviceIDs = (this.richService.service.requiredResources || []).concat(this.richService.service.relatedResources || [])
            //   .filter((e, i, a) => a.indexOf(e) === i && e !== '');
            // if (serviceIDs.length > 0) {
            //   this.resourceService.getSelectedServices(serviceIDs)
            //     .subscribe(services => this.services = services,
            //       err => {
            //         console.log(err.error);
            //         this.errorMessage = err.error;
            //       });
            // }
          },
          err => {
            this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
          },
          () => {
            this.loading = false;
            this.context = this.richService.service.description;
          });
      });
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onOutletLoaded(component) {
    console.log(component);
    // console.log('1 ' +  this.loading);
    if (this.loading){
      console.log(this.loading);
      this.timeOut(300).then(() => this.onOutletLoaded(component));
      return;
    } else {
      component.form = this.form;
      component.model = this.model;
      component.vocabularies = this.vocabularies;
    }
    return;
  }

  setCountriesForService(data: any) {
    if (this.richService) {
      const places = this.resourceService.expandRegion(JSON.parse(JSON.stringify(data || [])), this.EU, this.WW);

      let map = mapEU;
      data.forEach(function (element) {
        if (element === 'WW') {
          map = mapWorld;
        }
      });

      this.serviceMapOptions = {
        chart: {
          map: map,
          // borderWidth: 1
        },
        title: {
          text: 'Countries serviced by ' + this.richService.service.name
        },
        legend: {
          enabled: false
        },
        series: [{
          name: 'Country',
          data: places.map(e => e.toLowerCase()).map(e => [e, 1]),
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            formatter: function () {
              if (this.point.value) {
                return this.point.name;
              }
            }
          },
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}'
          }
        }]
      };
    }
  }

  addToFavourites() {
    this.userService.addFavourite(this.richService.service.id, !this.richService.isFavourite).pipe(
      flatMap(e => this.resourceService.getSelectedServices([e.service])))
      .subscribe(
        res => {
          Object.assign(this.richService, res[0]);
        },
        err => {
          this.errorMessage = 'Could not add service to favourites. ' + err.error;
        }
      );
  }

  rateService(rating: number) {
    this.userService.rateService(this.richService.service.id, rating).pipe(
      flatMap(e => this.resourceService.getSelectedServices([e.service])))
      .subscribe(
        res => {
          Object.assign(this.richService, res[0]);
        },
        err => {
          this.errorMessage = 'Could not add a rating to this service. ' + err.error;
        }
      );
  }

  getPrettyService(id) {
    return (this.services || []).find(e => e.service.id === id);
    // || {id, name: 'Name not found!'};
  }

  handleError(error) {
    this.errorMessage = 'System error loading service (Server responded: ' + error + ')';
  }

  showFormFields() {
    this.showForm = !this.showForm;
  }

  getLocations() {
    this.resourceService.getNewVocabulariesByType(Type.COUNTRY).subscribe(
      suc => {
        this.places = suc;
        this.placesVocIdArray = this.places.map(place => place.id);
      },
      err => {
        this.errorMessage = 'Could not retrieve Places from server. ' + err.error;
      }
    );
  }

  getPlace(placeId: string) {
    return this.places.find(value => value.id === placeId);
  }

  initializations() {
    /** Create form **/
    let tmpForm: any = {};
    tmpForm['service'] = this.formService.toFormGroup(this.model, true);
    tmpForm['extras'] = this.formService.toFormGroup(this.model, false);
    this.form = this.fb.group(tmpForm);

    /** Initialize and sort vocabulary arrays **/
    // let voc: Vocabulary[] = this.vocabularies['Subcategory'].concat(this.vocabularies['Scientific subdomain']);
    // this.subVocabularies = this.groupByKey(voc, 'parentId');
    for (const [key, value] of Object.entries(this.vocabularies)) {
      this.premiumSort.transform(this.vocabularies[key], ['English', 'Europe', 'Worldwide']);
    }
  }

  prepareForm(form: Object) {
    for (let key in form) {
      for (let formElementKey in form[key]) {
        if (form[key].hasOwnProperty(formElementKey)) {
          if (Array.isArray(form[key][formElementKey])) {
            // console.log(form[key][formElementKey]);
            // console.log(formElementKey);
            let formFieldData = this.getModelData(this.model, formElementKey);
            let i = 1;
            if (formFieldData.field.type === 'composite') { // In order for the fields to be enabled
              this.popComposite(key, formElementKey);  // remove it first
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

  push(group: string, field: string, required: boolean) {
    let tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.push(required ? new FormControl('', Validators.required) : new FormControl(''));
  }

  pushComposite(group: string, field: string, subFields: Fields[]) {
    const formGroup: any = {};
    subFields.forEach(subField => {
      formGroup[subField.field.name] = subField.field.form.mandatory ? new FormControl('', Validators.required)
        : new FormControl('');
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
        if (model[i].fields[j].field.name === name) {
          return model[i].fields[j];
        }
      }
    }
  }

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

  getServiceArray(field: string) {
    return this.form.get('service.' + field) as FormArray;
  }

  getServiceField(field: string) {
    return this.form.get('service.' + field) as FormControl;
  }

  getVocabularyName(field: string, name: string): string {
    let vocType;
    for (let i = 0; i < this.model.length; i++) {
      for (let j = 0; j < this.model[i].fields.length; j++) {
        if (this.model[i].fields[j].field.name === field && this.model[i].fields[j].field.type === 'vocabulary') {
          vocType = this.model[i].fields[j].field.form.vocabulary;
          for (let k = 0; k < this.vocabularies[vocType].length; k++) {
            if (this.vocabularies[vocType][k].id === name) {
              return (this.vocabularies[vocType][k].name);
            }
          }
        }
      }
    }
  }

  getCompositeVocName(field: string, id: string): string {
    for (let k = 0; k < this.vocabularies[field].length; k++) {
      if (this.vocabularies[field][k].id === id) {
        return (this.vocabularies[field][k].name);
      }
    }
  }

}
