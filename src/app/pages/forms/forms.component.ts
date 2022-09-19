import {Component, OnInit} from '@angular/core';
import {Model} from '../../../catalogue-ui/domain/dynamic-form-model';
import {FormControlService} from '../../../catalogue-ui/services/form-control.service';

@Component({
  selector: 'app-form',
  templateUrl: 'forms.component.html',
  providers: [FormControlService]
})

export class FormsComponent implements OnInit{

  tabsHeader: string = null;
  model: Model = null;

  constructor(private formService: FormControlService) {
  }

  ngOnInit() {
    this.formService.getFormModelById('m-rEmtKuZd').subscribe(
      next =>{ this.model = next}
    );
  }
}
