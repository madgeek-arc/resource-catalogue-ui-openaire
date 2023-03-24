import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {UserInfo} from '../entities/userInfo';
import {Provider} from '../entities/eic-model';

@Injectable()
export class UserService {
  base = environment.API_ENDPOINT;

  constructor(private http: HttpClient) {}

  getUserInfo() {
    return this.http.get<UserInfo>(this.base + '/user/info');
  }

  getMyProviders() {
    return this.http.get<Provider[]>(this.base + '/providers/my');
  }
}
