import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Bundle, Datasource, Provider, ProviderBundle, Service} from '../entities/eic-model';
import {BundleStatus} from '../entities/bundle-status';
import {environment} from '../../environments/environment';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Paging} from '../entities/paging';
import {URLParameter} from '../entities/url-parameter';

@Injectable({providedIn: 'root'})
export class ProviderService {
  http = inject(HttpClient);


  private base = environment.API_ENDPOINT;
  private oa = this.base + '/oa';
  private httpOption = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json;charset=UTF-8',
      Accept: 'application/json;charset=UTF-8'
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

  createNewServiceProvider(newProvider: Provider) {
    return this.http.post<Provider>(this.oa + '/providers', newProvider, this.options);
  }

  createNewServiceProviderWithToken(newProvider: Provider, token: string) {
    let params = new HttpParams();
    params = params.append('invitation', token);
    return this.http.post<Provider>(this.oa + '/providers', newProvider, {params, withCredentials: true});
  }

  updateServiceProvider(updatedFields: Provider, providerId?: string | null): Observable<Provider> {
    // console.log(`knocking on: ${this.base}/provider`);
    return this.http.put<Provider>(this.oa + `/providers/${providerId}`, updatedFields, this.options);
  }

  getProviderById(id: string) {
    return this.http.get<Provider>(this.oa + `/providers/${id}`, this.options);
  }

  getProviderBundleById(id: string) {
    return this.http.get<ProviderBundle>(this.oa + `/providers/bundles/${id}`, this.options);
  }

  getProviderBundles(urlParameters: URLParameter[] = []) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    return this.http.get<Paging<ProviderBundle>>(this.oa + '/providers/bundles', {params: searchQuery, withCredentials: true});
  }

  /**
   * One page of the provider's service bundles. The endpoint takes from and quantity (10 by default), status, active,
   * and sort with order (sort=modifiedAt&order=desc); it reads any other key as a filter, so an unknown one
   * matches nothing.
   */
  getServicesOfProvider(providerId: string, urlParameters: URLParameter[] = []): Observable<Paging<Bundle<Service | Datasource>>> {
    let params = new HttpParams().set('resourceProviders', providerId);
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        params = params.append(urlParameter.key, value);
      }
    }
    return this.http.get<Paging<Bundle<Service | Datasource>>>(this.oa + '/services/bundles', {...this.options, params});
  }

  // TODO: no terms endpoint in new API
  hasAdminAcceptedTerms(id: string) {
    return this.http.get<boolean>(this.base + `/providers/hasAdminAcceptedTerms?providerId=${id}`);
  }

  // TODO: no terms endpoint in new API
  adminAcceptedTerms(id: string) {
    return this.http.put(this.base + `/provider/adminAcceptedTerms?providerId=${id}`, this.options);
  }

  validateUrl(url: string) {
    // console.log(`knocking on: ${this.base}/provider/validateUrl?urlForValidation=${url}`);
    // TODO: no validateUrl endpoint in new API; treat URL as valid when the call fails so forms are not blocked
    return this.http.get<boolean>(this.base + `/provider/validateUrl?urlForValidation=${url}`).pipe(catchError(() => of(true)));
  }

  verifyProvider(id: string, active: boolean, status: BundleStatus, comment?: string) {
    const action = status === 'rejected' ? 'reject' : 'approve';
    return this.http.post(this.oa + `/providers/bundles/${id}/${action}`, {comment}, this.options);
  }

  publishProvider(id: string, active: boolean, comment?: string) { // toggles active/inactive provider
    return this.http.post(this.oa + `/providers/bundles/${id}/${active ? 'activate' : 'deactivate'}`, {comment}, this.options);
  }

  deleteProvider(id: string) {
    return this.http.delete(this.oa + `/providers/${id}`, this.options);
  }
}
