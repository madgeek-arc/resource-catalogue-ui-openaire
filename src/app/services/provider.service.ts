import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Bundle, Datasource, Provider, ProviderBundle, Service} from '../entities/eic-model';
import {environment} from '../../environments/environment';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
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

  createNewServiceProvider(newProvider: Provider, providerId?: string | null) {
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

  // TODO: no pendingProvider endpoint in new API
  updateAndPublishPendingProvider(updatedFields: Provider, providerId?: string | null): Observable<Provider> {
    return this.http.put<Provider>(this.base + '/pendingProvider/transform/active', updatedFields, this.options);
  }

  getProviderById(id: string) {
    return this.http.get<Provider>(this.oa + `/providers/${id}`, this.options);
  }

  getProviderBundleById(id: string) {
    return this.http.get<ProviderBundle>(this.oa + `/providers/bundles/${id}`, this.options);
  }

  // TODO: no pendingProvider endpoint in new API
  getPendingProviderById(id: string) {
    return this.http.get<Provider>(this.base + `/pendingProvider/provider/${id}`, this.options);
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

  getServicesOfProvider(providerId: string, urlParameters?: URLParameter[]): Observable<Paging<Bundle<Service | Datasource>>> {
    // New API returns a plain array of every service of the provider; wrap it as Paging so callers keep working.
    // Old filters/paging params (orderField, from, quantity...) are not supported by this endpoint.
    // byProvider returns plain services, while the dashboard needs bundles (status, active), so fetch each bundle.
    return this.http.get<Service[]>(this.oa + `/services/byProvider/${providerId}`, this.options).pipe(
      switchMap(services => services.length === 0 ? of([]) : forkJoin(services.map(service =>
        this.http.get<Bundle<Service>>(this.oa + `/services/bundles/${service.id}`, this.options)))),
      map(results => ({total: results.length, from: 0, to: results.length, results, facets: []} as Paging<Bundle<Service | Datasource>>))
    );
  }

  // TODO: no pendingProvider (draft) endpoint in new API
  temporarySaveProvider(provider: Provider, providerExists: boolean) {
    // console.log('providerExists ', providerExists);
    if (providerExists) {
      return this.http.put<Provider>(this.base + '/pendingProvider/provider', provider, this.options);
    }
    return this.http.put<Provider>(this.base + '/pendingProvider/pending', provider, this.options);
  }

  // TODO: no terms endpoint in new API
  hasAdminAcceptedTerms(id: string, pendingProvider: boolean) {
    if (pendingProvider) {
      return this.http.get<boolean>(this.base + `/pendingProvider/hasAdminAcceptedTerms?providerId=${id}`);
    }
    return this.http.get<boolean>(this.base + `/providers/hasAdminAcceptedTerms?providerId=${id}`);
  }

  // TODO: no terms endpoint in new API
  adminAcceptedTerms(id: string, pendingProvider: boolean) {
    if (pendingProvider) {
      return this.http.put(this.base + `/pendingProvider/adminAcceptedTerms?providerId=${id}`, this.options);
    }
    return this.http.put(this.base + `/provider/adminAcceptedTerms?providerId=${id}`, this.options);
  }

  validateUrl(url: string) {
    // console.log(`knocking on: ${this.base}/provider/validateUrl?urlForValidation=${url}`);
    // TODO: no validateUrl endpoint in new API; treat URL as valid when the call fails so forms are not blocked
    return this.http.get<boolean>(this.base + `/provider/validateUrl?urlForValidation=${url}`).pipe(catchError(() => of(true)));
  }

  verifyProvider(id: string, active: boolean, status: string, comment?: string) {
    // old status values: 'approved provider' | 'rejected provider'
    const action = status && status.startsWith('rejected') ? 'reject' : 'approve';
    return this.http.post(this.oa + `/providers/bundles/${id}/${action}`, {comment}, this.options);
  }

  publishProvider(id: string, active: boolean, comment?: string) { // toggles active/inactive provider
    return this.http.post(this.oa + `/providers/bundles/${id}/${active ? 'activate' : 'deactivate'}`, {comment}, this.options);
  }

  deleteProvider(id: string) {
    return this.http.delete(this.oa + `/providers/${id}`, this.options);
  }
}
