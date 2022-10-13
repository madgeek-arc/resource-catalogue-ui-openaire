import {Component, OnInit, ViewChild} from '@angular/core';
import {Model} from '../../../catalogue-ui/domain/dynamic-form-model';
import {FormControlService} from '../../../catalogue-ui/services/form-control.service';
import {SurveyComponent} from '../../../catalogue-ui/pages/dynamic-form/survey.component';
import {ResourceService} from '../../services/resource.service';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {zip} from 'rxjs/internal/observable/zip';
import {Vocabulary} from '../../entities/eic-model';

@Component({
  selector: 'app-form',
  templateUrl: 'forms.component.html',
  providers: [FormControlService]
})

export class FormsComponent implements OnInit{

  @ViewChild(SurveyComponent) child: SurveyComponent;

  tabsHeader: string = null;
  model: Model = null;
  vocabulariesMap: Map<string, Vocabulary[]> = null
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
            this.resourceService.getAllVocabulariesByType()).subscribe(
            next => {
              this.payloadAnswer['answer'].Service = next[0];
              this.model = next[1];
              this.vocabulariesMap = next[2];
              console.log(this.vocabulariesMap);
            },
            error => {console.log(error)},
            () => {this.ready = true}
          );
        } else {
          zip(
            this.formService.getFormModelById('m-rEmtKuZd'),
            this.resourceService.getAllVocabulariesByType()).subscribe(
            next => {
              this.model = next[0];
              this.vocabulariesMap = next[1];
            },
            error => {console.log(error)},
            () => {this.ready = true}
          );
        }

      },
      error => {console.log(error)}
    );
  }

  submitForm(form: FormGroup) {
    this.resourceService.postService(form.getRawValue()).subscribe(
      next => {},
      error => {console.log(error);}
    );
  }

}