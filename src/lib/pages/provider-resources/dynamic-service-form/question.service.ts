import { Injectable } from '@angular/core';

import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from '../../../services/authentication.service';
import {environment} from '../../../../environments/environment';
import {FormModel} from '../../../domain/dynamic-form-model';

@Injectable()
export class QuestionService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }

  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  getFormModel() {
    return this.http.get<FormModel[]>(this.base + '/ui/form/model');
  }

}
