import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {InfraService, Provider, ProviderBundle, ProviderRequest, Service, ServiceHistory, VocabularyCuration} from '../entities/eic-model';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Paging} from '../entities/paging';

@Injectable()
export class ServiceProviderService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }

  private base = environment.API_ENDPOINT;
  private httpOption = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json;charset=UTF-8'
    })
  };

  private options = {withCredentials: true};

  static checkUrl(url: string) {
    if (url !== '') {
      if (!url.match(/^(https?:\/\/.+)?$/)) {
        url = 'http://' + url;
      }
    }
    return url;
  }

  createNewServiceProvider(newProvider: any) {
    // console.log(`knocking on: ${this.base}/provider`);
    return this.http.post(this.base + '/provider', newProvider, this.options);
  }

  updateServiceProvider(updatedFields: any): Observable<Provider> {
    // console.log(`knocking on: ${this.base}/provider`);
    return this.http.put<Provider>(this.base + '/provider', updatedFields, this.options);
  }

  updateAndPublishPendingProvider(updatedFields: any): Observable<Provider> {
    return this.http.put<Provider>(this.base + '/pendingProvider/transform/active', updatedFields, this.options);
  }

  getServiceProviderById(id: string) {
    return this.http.get<Provider>(this.base + `/providers/${id}`, this.options);
  }

  getPendingProviderById(id: string) {
    return this.http.get<Provider>(this.base + `/pendingProvider/provider/${id}`, this.options);
  }

  getServicesOfProvider(id: string, from: string, quantity: string, order: string, orderField: string, active: string, query?: string) {
    if (!query) { query = ''; }
    if (active === 'statusAll') {
      return this.http.get<Paging<InfraService>>(this.base +
        `/service/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&query=${query}`);
    }
    return this.http.get<Paging<InfraService>>(this.base +
      `/service/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&active=${active}&query=${query}`);
  }

  temporarySaveProvider(provider: Provider, providerExists: boolean) {
    // console.log('providerExists ', providerExists);
    if (providerExists) {
      return this.http.put<Provider>(this.base + '/pendingProvider/provider', provider, this.options);
    }
    return this.http.put<Provider>(this.base + '/pendingProvider/pending', provider, this.options);
  }

  hasAdminAcceptedTerms(id: string, pendingProvider: boolean) {
    if (pendingProvider) {
      return this.http.get<boolean>(this.base + `/pendingProvider/hasAdminAcceptedTerms?providerId=${id}`);
    }
    return this.http.get<boolean>(this.base + `/providers/hasAdminAcceptedTerms?providerId=${id}`);
  }

  adminAcceptedTerms(id: string, pendingProvider: boolean) {
    if (pendingProvider) {
      return this.http.put(this.base + `/pendingProvider/adminAcceptedTerms?providerId=${id}`, this.options);
    }
    return this.http.put(this.base + `/provider/adminAcceptedTerms?providerId=${id}`, this.options);
  }

  validateUrl(url: string) {
    // console.log(`knocking on: ${this.base}/provider/validateUrl?urlForValidation=${url}`);
    return this.http.get<boolean>(this.base + `/provider/validateUrl?urlForValidation=${url}`);
  }

  submitVocabularyEntry(entryValueName: string, vocabulary: string, parent: string, resourceType: string, providerId?: string, resourceId?: string) {
    // console.log(`knocking on: ${this.base}/vocabularyCuration/addFront?entryValueName=${entryValueName}&vocabulary=${vocabulary}&parent=${parent}&resourceType=${resourceType}&providerId=${providerId}&resourceId=${resourceId}`);
    if (providerId && resourceId) {
      return this.http.post(this.base + `/vocabularyCuration/addFront?entryValueName=${entryValueName}&vocabulary=${vocabulary}&parent=${parent}&resourceType=${resourceType}&providerId=${providerId}&resourceId=${resourceId}`, this.options);
    } else if (providerId) {
      return this.http.post(this.base + `/vocabularyCuration/addFront?entryValueName=${entryValueName}&vocabulary=${vocabulary}&parent=${parent}&resourceType=${resourceType}&providerId=${providerId}`, this.options);
    } else {
      return this.http.post(this.base + `/vocabularyCuration/addFront?entryValueName=${entryValueName}&vocabulary=${vocabulary}&parent=${parent}&resourceType=${resourceType}`, this.options);
    }
  }

}
