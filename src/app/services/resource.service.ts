import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {skipNotFoundRedirect} from './authentication-interceptor';
import {environment} from '../../environments/environment';
import {Provider, Service, ServiceHistory, Vocabulary, Type, Datasource, Bundle} from '../entities/eic-model';
import {Paging,} from '../entities/paging';
import {URLParameter} from '../entities/url-parameter';
import {PortfolioMap, ServiceSnippet} from '../entities/portfolioMap';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';


@Injectable()
export class ResourceService {

  base = environment.API_ENDPOINT;
  private oa = this.base + '/oa';
  private options = {withCredentials: true};

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {}

  static removeNulls(obj) {
    const isArray = obj instanceof Array;
    for (const k in obj) {
      if (obj[k] === null || obj[k] === '') {
        isArray ? obj.splice(k, 1) : delete obj[k];
      } else if (typeof obj[k] === 'object') {
        if (typeof obj[k].value !== 'undefined' && typeof obj[k].lang !== 'undefined') {
          if (obj[k].value === '' && obj[k].lang === 'en') {
            obj[k].lang = '';
          }
        }
        ResourceService.removeNulls(obj[k]);
      }
      if (obj[k] instanceof Array && obj[k].length === 0) {
        delete obj[k];
      } else if (obj[k] instanceof Array) {
        for (const l in obj[k]) {
          if (obj[k][l] === null || obj[k][l] === '') {
            delete obj[k][l];
          }
        }
      }
    }
  }

  getServiceOrDatasource(resourceId: string): Observable<Service | Datasource> { //todo: get rid of this
    return this.http.get<Service>(this.oa + `/services/${resourceId}`, {...this.options, context: skipNotFoundRedirect()}).pipe(
      catchError(() => this.http.get<Datasource>(this.oa + `/datasources/${resourceId}`, this.options))
    );
  }

  search(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    return this.http.get<Paging<Service>>(this.oa + `/services?${searchQuery.toString()}`, this.options);
  }

  getBundleOfServices(urlParameters?: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    return this.http.get<Paging<Bundle<Service>>>(this.oa + '/services/bundles', {params: searchQuery, withCredentials: true});
  }

  getBundleOfDatasources(urlParameters?: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    return this.http.get<Paging<Bundle<Datasource>>>(this.oa + '/datasources/bundles', {params: searchQuery, withCredentials: true});
  }

  // TODO: no catalogue-resources endpoint in new API
  getResourceTypeById(id: string) {
    return this.http.get(this.base + `/catalogue-resources/${id}/resourceType`);
  }

  searchWithDatasource(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    return this.http.get<Paging<Service | Datasource>>(this.oa + `/services`, {params: searchQuery}); // TODO: new API has no combined services+datasources search
  }

  getServicesSnippetByUserContentAndPortfolioType(userType: string, portfolioType?: string) {
    const url = (portfolioType ? `/services?quantity=100&users=${userType}&portfolios=${portfolioType}` : `/services?quantity=100&users=${userType}`);
    return this.http.get<Paging<Service>>(this.oa + url, this.options); // TODO: users/portfolios filters may be unsupported
  }

  getVocabularyById(id: string) {
    return this.http.get<Vocabulary>(this.base + `/vocabularies/${id}`);
  }

  getAllVocabulariesByType() {
    return this.http.get<Map<Type, Vocabulary[]>>(this.base + `/vocabularies/byType`);
  }

  getNewVocabulariesByType(type: string) {
    return this.http.get<Vocabulary[]>(this.base + `/vocabularies/byType/${type}`);
  }

  getUiVocabularies() {
    return this.http.get<Map<string, object[]>>(this.base + `/vocabularies/mappings`);
  }

  getServicesByVocabularyTypeAndId(type: string, id?: string) {
    if (id) {
      let params = new HttpParams();
      params = params.append(type, id);
      params = params.append('quantity','100');
      return this.http.get<Paging<Service>>(this.oa + `/services`, {params}); // TODO: vocabulary filters may be unsupported
    } else {
      return this.http.get<Paging<Service>>(this.oa + `/services`);
    }
  }

  getServicesByIdArray(idArray: string[]): Observable<Service[]> {
    if (!idArray || idArray.length === 0) {
      return of([]);
    }
    return forkJoin(idArray.map(id => this.http.get<Service>(this.oa + `/services/${id}`, {context: skipNotFoundRedirect()}).pipe(catchError(() => of(null)))))
      .pipe(map(services => services.filter(s => s !== null)));
  }

  /**
   * Active services grouped by the name of a vocabulary entry (e.g. 'portfolios' -> {'Assess': [...], ...}).
   * The new API has no catalogue-resources/by/{field} endpoint, so this reads the vocabulary and runs one filtered
   * /oa/services search per entry (the list endpoint only returns active services).
   */
  getResourcesGroupedByField(field: string, active?: boolean): Observable<Map<string, Service[] | Datasource[]>> {
    const vocabularyType = field.charAt(0).toUpperCase() + field.slice(1); // portfolios -> Portfolios
    return this.getNewVocabulariesByType(vocabularyType).pipe(
      switchMap(vocabularies => (vocabularies || []).length === 0 ? of([]) : forkJoin(vocabularies.map(vocabulary => {
        const params = new HttpParams().append(field, vocabulary.id).append('quantity', '100');
        return this.http.get<Paging<Service>>(this.oa + '/services', {params}).pipe(
          map(paging => [vocabulary.name, paging.results] as [string, Service[]]),
          catchError(() => of([vocabulary.name, []] as [string, Service[]]))
        );
      }))),
      // Templates read it both as resources[name] and with the keyvalue pipe, so return a plain object.
      map(groups => groups.reduce((acc, [name, services]) => ({...acc, [name]: services}), {}) as any)
    );
  }

  getMyServiceProviders() {
    return this.http.get<Provider[]>(this.oa + '/providers/my', this.options);
  }

  postService(service: Service) {
    return this.http.post<Service>(this.oa + '/services', service, this.options);
  }

  getService(serviceId: string) {
    return this.http.get<Service>(this.oa + `/services/${serviceId}`);
  }

  editService(service: Service) {
    return this.http.put<Service>(this.oa + `/services/${service.id}`, service, this.options);
  }

  postDatasource(datasource: Datasource) {
    return this.http.post<Datasource>(this.oa + '/datasources', datasource, this.options);
  }

  getDatasource(datasourceId: string) {
    return this.http.get<Datasource>(this.oa + `/datasources/${datasourceId}`);
  }

  editDatasource(datasource: Datasource) {
    return this.http.put<Datasource>(this.oa + `/datasources/${datasource.id}`, datasource, this.options);
  }

  // TODO: no history endpoint in new API
  getServiceHistory(serviceId: string) {
    return this.http.get<Paging<ServiceHistory>>(this.base + `/service/history/${serviceId}/`);
  }

  getServiceOrDatasourceBundle(resourceId: string) {
    return this.http.get<Bundle<Service | Datasource>>(this.oa + `/services/bundles/${resourceId}`, {...this.options, context: skipNotFoundRedirect()}).pipe(
      catchError(() => this.http.get<Bundle<Service | Datasource>>(this.oa + `/datasources/bundles/${resourceId}`, this.options))
    );
  }

  verifyService(id: string, active: boolean, status: string, comment?: string) {
    // old status values: 'approved resource' | 'rejected resource'
    const action = status && status.startsWith('rejected') ? 'reject' : 'approve';
    return this.http.post(this.oa + `/services/bundles/${id}/${action}`, {comment}, this.options);
  }

  publishService(id: string, active: boolean, comment?: string) { // toggles active/inactive
    return this.http.post(this.oa + `/services/bundles/${id}/${active ? 'activate' : 'deactivate'}`, {comment}, this.options);
  }

  deleteService(id: string) {
    return this.http.delete(this.oa + `/services/${id}`, this.options);
  }

  verifyDatasource(id: string, active: boolean, status: string, comment?: string) {
    // old status values: 'approved resource' | 'rejected resource'
    const action = status && status.startsWith('rejected') ? 'reject' : 'approve';
    return this.http.post(this.oa + `/datasources/bundles/${id}/${action}`, {comment}, this.options);
  }

  publishDatasource(id: string, active: boolean, comment?: string) { // toggles active/inactive
    return this.http.post(this.oa + `/datasources/bundles/${id}/${active ? 'activate' : 'deactivate'}`, {comment}, this.options);
  }

  deleteDatasource(id: string) {
    return this.http.delete(this.oa + `/datasources/${id}`, this.options);
  }

  // TODO: no datasources/byService endpoint in new API
  getDatasourceByServiceId(serviceId: string){
    return this.http.get<Datasource>(this.base + `/datasources/byService/${serviceId}`, this.options);
  }
}
