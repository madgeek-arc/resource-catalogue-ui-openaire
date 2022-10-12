import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {EmailMessage} from '../entities/eic-model';

@Injectable()
export class EmailService {
  private base = environment.API_ENDPOINT;

  constructor(private http: HttpClient) {}

  sendMail(serviceIds: string[], emailMessage: EmailMessage) {
    return this.http.post<EmailMessage>(this.base + `/request/${serviceIds}/sendMailsToProviders`,
      emailMessage, {withCredentials: true});
  }
}
