import {Component, OnInit} from '@angular/core';

import { QuestionService } from './question.service';
import { Observable } from 'rxjs';
import {FormModel} from '../../../domain/dynamic-form-model';

@Component({
  selector: 'app-test',
  templateUrl: 'dynamic-form-test.component.html',
  providers:  [QuestionService]
})
export class DynamicFormTestComponent implements OnInit {
  fields: FormModel[];

  constructor(protected service: QuestionService) {}

  ngOnInit() {
    this.service.getFormModel().subscribe( res => {
      this.fields = res;
    });
  }
}
