import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Model} from '../../../catalogue-ui/domain/dynamic-form-model';
import {FormControlService} from '../../../catalogue-ui/services/form-control.service';
import {SurveyComponent} from '../../../catalogue-ui/pages/dynamic-form/survey.component';
import {ResourceService} from '../../services/resource.service';
import {zip} from 'rxjs/internal/observable/zip';
import {Datasource, Service, Vocabulary} from '../../entities/eic-model';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';

import * as uikit from 'uikit';

@Component({
  selector: 'app-form',
  templateUrl: 'forms.component.html',
  providers: [FormControlService]
})

export class FormsComponent implements OnInit{

  @ViewChild(SurveyComponent) child: SurveyComponent;

  tabsHeader: string = null;
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = new Map<string, object[]>();
  subVocabulariesMap: Map<string, object[]> = null
  premiumSort = new PremiumSortPipe();
  resourceId: string = null;
  resourceType: string = null;
  payloadAnswer: object = null; // Find a way to do this better
  ready: boolean = false
  errorMessage: string = null;

  constructor(private formService: FormControlService, private resourceService: ResourceService,
              private route: ActivatedRoute, private router: Router ) {}

  ngOnInit() {
    this.ready = false;
    this.route.params.subscribe(
      params => {
        this.resourceId = params['resourceId']
        if (this.resourceId) { // edit resource
          this.resourceService.getResourceTypeById(this.resourceId).subscribe(
            res => {
              this.resourceType = res['resourceType'];
              zip(
                this.resourceService.getServiceOrDatasource(this.resourceId),
                this.formService.getFormModelByResourceType(this.resourceType),
                this.resourceService.getUiVocabularies()).subscribe(
                next => {
                  this.payloadAnswer = {'answer': {'Service': {}}};
                  this.payloadAnswer['answer'].Service = next[0];
                  this.model = next[1].results[0];
                  this.vocabulariesMap = next[2];
                },
                error => {console.log(error)},
                () => {
                  this.prepareVocabularies();
                  this.ready = true;
                }
              );
            }
          )
        } else { // add new resource
          this.resourceType = params['resourceType'];
          zip(
            this.formService.getFormModelByResourceType(this.resourceType),
            this.resourceService.getUiVocabularies()).subscribe(
            next => {
              this.model = next[0].results[0];
              this.vocabulariesMap = next[1];
            },
            error => {console.log(error)},
            () => {
              this.prepareVocabularies();
              this.ready = true;
            }
          );
        }

      },
      error => {console.log(error)}
    );
  }

  submitForm(value) {
    this.ready = false;
    // console.log(value[0].get('Service').value);
    let service: Service = {...value[0].get('Service').value};
    // for (const element in value[0].get('Service').controls) {
    //   console.log(element+' is '+ value[0].get('Service').get(element).valid);
    //   console.log(value[0].get('Service').get(element).value);
    // }
    if (!service.multimedia[0].multimediaURL) {
      service.multimedia = null;
    }
    if (!service.useCases[0].useCaseURL) {
      service.useCases = null;
    }
    if (this.resourceType === 'service') {
      if (value[1]) {
        this.resourceService.editService(service).subscribe(
          next => {
            this.router.navigate([`/service/${next.id}/overview`]);
          },
          error => {
            console.log(error);
            this.errorMessage = error.error.message + '\nFor more information please provide the error code to the system administrators. \nError Code: '+ error.error.transactionId;
            this.ready = true;
          }
        );
      } else {
        this.resourceService.postService(service).subscribe(
          next => {
            this.router.navigate([`/service/${next.id}/overview`]);
          },
          error => {
            console.log(error);
            this.errorMessage = error.error.message + '\nFor more information please provide the error code to the system administrators. \nError Code: '+ error.error.transactionId;
            this.ready = true;
          }
        );
      }
    }
    if (this.resourceType === 'datasource') {
      let datasource: Datasource = {...value[0].get('Service').value};
      if (!datasource.multimedia[0].multimediaURL) {
        datasource.multimedia = null;
      }
      if (!datasource.useCases[0].useCaseURL) {
        datasource.useCases = null;
      }
      if (value[1]) {
        this.resourceService.editDatasource(datasource).subscribe(
          next => {
            this.router.navigate([`/service/${next.id}/overview`]);
          },
          error => {
            console.log(error);
            this.errorMessage = error.error.message + '\nFor more information please provide the error code to the system administrators. Error Code: '+ error.error.transactionId;
            this.ready = true;
          }
        );
      } else {
        this.resourceService.postDatasource(datasource).subscribe(
          next => {
            this.router.navigate([`/service/${next.id}/overview`]);
          },
          error => {
            console.log(error);
            this.errorMessage = error.error.message + '\nFor more information please provide the error code to the system administrators. Error Code: '+ error.error.transactionId;
            this.ready = true;
          }
        );
      }
    }
  }

  prepareVocabularies() {
    this.sortVocabulariesByName(this.vocabulariesMap['Scientific domain']);
    this.sortVocabulariesByName(this.vocabulariesMap['Scientific subdomain']);
    this.sortVocabulariesByName(this.vocabulariesMap['Category']);
    this.sortVocabulariesByName(this.vocabulariesMap['Subcategory']);
    let voc: Vocabulary[] = this.vocabulariesMap['Subcategory'].concat(this.vocabulariesMap['Scientific subdomain']);
    this.subVocabulariesMap = this.groupByKey(voc, 'parentId');
    this.sortVocabulariesByName(this.vocabulariesMap['Access type']);
    this.sortVocabulariesByName(this.vocabulariesMap['Access mode']);
    this.sortVocabulariesByName(this.vocabulariesMap['Target user']);
    this.sortVocabulariesByName(this.vocabulariesMap['Language']);
    this.sortVocabulariesByName(this.vocabulariesMap['Country']);
    this.sortVocabulariesByName(this.vocabulariesMap['Technology readiness level']);
    this.sortVocabulariesByName(this.vocabulariesMap['Life cycle status']);
    this.sortVocabulariesByName(this.vocabulariesMap['Funding body']);
    this.sortVocabulariesByName(this.vocabulariesMap['Funding program']);
    this.vocabulariesMap['RegionOrCountry'] = this.vocabulariesMap['Country'].concat(this.vocabulariesMap['Region']);
    this.premiumSort.transform(this.vocabulariesMap['RegionOrCountry'], ['Europe', 'Worldwide']);
  }

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

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

}
