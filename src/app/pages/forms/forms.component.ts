import {Component, OnInit, ViewChild} from '@angular/core';
import {Model} from '../../../catalogue-ui/domain/dynamic-form-model';
import {FormControlService} from '../../../catalogue-ui/services/form-control.service';
import {SurveyComponent} from '../../../catalogue-ui/pages/dynamic-form/survey.component';
import {ResourceService} from '../../services/resource.service';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: 'forms.component.html',
  providers: [FormControlService]
})

export class FormsComponent implements OnInit{

  @ViewChild(SurveyComponent) child: SurveyComponent;

  tabsHeader: string = null;
  model: Model = null;

  constructor(private formService: FormControlService, private resourceService: ResourceService) {
  }

  ngOnInit() {
    this.formService.getFormModelById('m-rEmtKuZd').subscribe(
      next =>{ this.model = next}
    );
  }

  submitForm(form: FormGroup) {
    this.resourceService.postService(form.getRawValue()).subscribe(
      next => {},
      error => {console.log(error);}
    );
  }

}
