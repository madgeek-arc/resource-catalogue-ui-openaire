import {Component, OnInit, ViewChild} from '@angular/core';
import {Model} from '../../../catalogue-ui/domain/dynamic-form-model';
import {FormControlService} from '../../../catalogue-ui/services/form-control.service';
import {SurveyComponent} from '../../../catalogue-ui/pages/dynamic-form/survey.component';
import {ResourceService} from '../../services/resource.service';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {zip} from 'rxjs/internal/observable/zip';
import {Vocabulary} from '../../entities/eic-model';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';

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
  payloadAnswer: object = {'answer': {'Service': {}}}; // Find a way to do this better
  ready: Boolean = false

  constructor(private formService: FormControlService, private resourceService: ResourceService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.ready = false;
    this.route.params.subscribe(
      params => {
        this.resourceId = params['resourceId']
        if (this.resourceId) {
          zip(
            this.resourceService.getResource(this.resourceId),
            this.formService.getFormModelById('m-rEmtKuZd'),
            this.resourceService.getUiVocabularies()).subscribe(
            next => {
              this.payloadAnswer['answer'].Service = next[0];
              this.model = next[1];
              this.vocabulariesMap = next[2];
            },
            error => {console.log(error)},
            () => {
              this.prepareVocabularies();
              this.ready = true;
            }
          );
        } else {
          zip(
            this.formService.getFormModelById('m-rEmtKuZd'),
            this.resourceService.getUiVocabularies()).subscribe(
            next => {
              this.model = next[0];
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

  submitForm(form: FormGroup) {
    console.log(form.valid);
    this.resourceService.postService(form.value).subscribe(
      next => {},
      error => {console.log(error);}
    );
  }

  prepareVocabularies() {
    let voc: Vocabulary[] = this.vocabulariesMap['Subcategory'].concat(this.vocabulariesMap['Scientific subdomain']);
    this.subVocabulariesMap = this.groupByKey(voc, 'parentId');
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

}
