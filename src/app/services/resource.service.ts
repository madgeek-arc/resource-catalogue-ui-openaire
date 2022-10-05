import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  Indicator,
  Measurement,
  VocabularyTree,
  Provider,
  RichService,
  Service,
  ServiceHistory,
  Vocabulary,
  Type, Snippet
} from '../entities/eic-model';
import {BrowseResults} from '../entities/browse-results';
import {Paging, SpringPaging} from '../entities/paging';
import {URLParameter} from '../entities/url-parameter';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Info} from '../entities/info';
import {PortfolioMap} from '../../app/entities/portfolioMap';

declare var UIkit: any;


@Injectable()
export class ResourceService {

  base = environment.API_ENDPOINT;
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

  getAll(resourceType: string) {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    return this.http.get(this.base + `/${resourceType}/all`, {params});
  }

  getAllIndicators(resourceType: string) {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    return this.http.get<Paging<Indicator>>(this.base + `/${resourceType}/all`, {params});
  }

  getBy(resourceType: string, resourceField: string) {
    return this.http.get(this.base + `/${resourceType}/by/${resourceField}/`);
  }

  getSome(resourceType: string, ids: string[]) {
    return this.http.get(this.base + `/${resourceType}/byID/${ids.toString()}/`);
  }

  getSomeSnippets(ids: string[]) {
    return this.http.get(this.base + `/ui/services/snippets/ids/${ids.toString()}`);
  }

  getResource(resourceId: string) {
    return this.http.get(this.base + `/services/${resourceId}`, this.options);
  }

  search(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    searchQuery.delete('to');
    /*return this.http.get(`/service/all${questionMark}${searchQuery.toString()}`).map(res => <SearchResults<Service>> <any> res);*/
    // const questionMark = urlParameters.length > 0 ? '?' : '';
    // return this.http.get<SearchResults<RichService>>(this.base + `/service/rich/all${questionMark}${searchQuery.toString()}`, this.options)
    return this.http.get<Paging<RichService>>(
      this.base + `/service/rich/all?orderField=name&order=asc&${searchQuery.toString()}`, this.options);
  }

  searchSnippets(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    searchQuery.delete('to');
    return this.http.post<SpringPaging<Snippet>>(this.base + `/services/snippets/search?${searchQuery.toString()}`, {}, this.options);
  }

  getServicesSnippetByUserContentAndPortfolioType(userType: string, portfolioType?: string) {
    const url = (portfolioType ? `/ui/services/snippets?quantity=100&users=${userType}&portfolios=${portfolioType}` : `/ui/services/snippets?quantity=100&users=${userType}`);
    return this.http.get<Paging<Snippet>>(this.base + url, this.options);
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

  getNestedVocabulariesByType(type: string) {
    return this.http.get<VocabularyTree>(this.base + `/vocabulary/vocabularyTree/${type}`);
  }

  getServicesByVocabularyTypeAndId(type: string, id?: string) {
    if (id) {
      let params = new HttpParams();
      params = params.append('value', id);
      return this.http.post<Map<string, Object[]>>(this.base + `/services/search`, {type: id});
    } else {
      return this.http.post<Map<string, Object[]>>(this.base + `/services/search`, {type: ""});
    }
  }

  getServicesByIndexedField(field: string, vocabularyType: string) {
      let params = new HttpParams();
      params = params.append('vocabularyType', vocabularyType);
      return this.http.get<PortfolioMap>(this.base + `/services/by/${field}?`, {params});
  }

  getSubcategoriesIdsFromSuperCategory(parent: string, type: string) {
    let params = new HttpParams();
    params = params.append('parent', parent);
    params = params.append('type', type);
    return this.http.get<string[]>(this.base + '/service/childrenFromParent', {params});
  }

  getServices() {
    return this.http.get(this.base + '/service/by/id/');
  }

  getService(id: string, version?: string) {
    // if version becomes optional this should be reconsidered
    return this.http.get<Service>(this.base + `/service/${version === undefined ? id : [id, version].join('/')}`, this.options);
  }

  getRichService(id: string, version?: string) {
    // if version becomes optional this should be reconsidered
    return this.http.get<RichService>(this.base + `/service/rich/${version === undefined ? id : [id, version].join('/')}/`, this.options);
  }

  getPendingService(id: string) {
    return this.http.get<RichService>(this.base + `/pendingService/rich/${id}/`, this.options);
  }

  getSelectedServices(ids: string[]) {
    /*return this.getSome("service", ids).map(res => <Service[]> <any> res);*/
    // return this.getSome('service/rich', ids).subscribe(res => <RichService[]><any>res);
    return this.http.get<RichService[]>(this.base + `/service/rich/byID/${ids.toString()}/`, this.options);
  }

  getServicesByCategories() {
    return this.http.get<BrowseResults>(this.base + '/service/by/category/');
  }

  getServicesOfferedByProvider(id: string): Observable<RichService[]> {
    return this.search([{key: 'quantity', values: ['100']}, {key: 'provider', values: [id]}]).pipe(
      map(res => Object.values(res.results))
    );
  }

  deleteService(id: string) {
    return this.http.delete(this.base + '/service/' + id, this.options);
  }

  deletePendingService(id: string) {
    return this.http.delete(this.base + '/pendingService/' + id, this.options);
  }

  /** Recommendations **/

  getRecommendedServices(limit: number) {
    return this.http.get<RichService[]>(this.base + `/recommendation/getRecommendationServices/${limit}/`, this.options);
  }

  /** STATS **/
  getVisitsForProvider(provider: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/provider/visits/${provider}`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/visits/${provider}`);
    }
  }

  getCategoriesPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', provider);
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=SUBCATEGORY`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=SUBCATEGORY`);
    }
  }

  getDomainsPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', provider);
    return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=SCIENTIFIC_SUBDOMAIN`, {params});
  } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=SCIENTIFIC_SUBDOMAIN`);
    }
  }

  getTargetUsersPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', provider);
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=TARGET_USERS`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=TARGET_USERS`);
    }
  }

  getAccessModesPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', provider);
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=ACCESS_MODES`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=ACCESS_MODES`);
    }
  }

  getAccessTypesPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', provider);
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=ACCESS_TYPES`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=ACCESS_TYPES`);
    }
  }

  getOrderTypesPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', provider);
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=ORDER_TYPE`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=ORDER_TYPE`);
    }
  }

  getMapDistributionOfServices(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', provider);
      return this.http.get(this.base + `/stats/provider/mapServicesToGeographicalAvailability`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToGeographicalAvailability`);
    }
  }

  getFavouritesForProvider(provider: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/provider/favourites/${provider}`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/favourites/${provider}`);
    }
  }

  getAddsToProjectForProvider(provider: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/provider/addToProject/${provider}`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/addToProject/${provider}`);
    }
  }

  getOrdersForProvider(provider: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/provider/orders/${provider}`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/orders/${provider}`);
    }
  }

  getRatingsForProvider(provider: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/provider/ratings/${provider}`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/ratings/${provider}`);
    }
  }

  getPlacesForProvider(provider: string) {
    return this.getServicesOfferedByProvider(provider);
  }

  getVisitsForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/service/visits/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/service/visits/${service}`);
  }

  getFavouritesForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/service/favourites/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/service/favourites/${service}`);
  }

  getAddToProjectForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/service/addToProject/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/service/addToProject/${service}`);
  }

  getRatingsForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/service/ratings/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/service/ratings/${service}`);
  }
  /** STATS **/

  /** Service Measurements **/
  getLatestServiceMeasurement(id: string) {
    return this.http.get<Paging<Measurement>>(this.base + `/measurement/latest/service/${id}`);
  }

  getServiceMeasurements(id: string) {
    return this.http.get<Paging<Measurement>>(this.base + `/measurement/service/${id}`);
  }

  postMeasurement(measurement: Measurement) {
    return this.http.post(this.base + '/measurement', measurement, this.options)
      ;
  }

  postMeasurementUpdateAll(id: string, measurement: Measurement[]) {
    let params = new HttpParams();
    params = params.append('serviceId', id);
    // const options = {params, withCredentials: true};
    return this.http.post(this.base + '/measurement/updateAll', measurement, {params, withCredentials: true});
  }
  /** Service Measurements **/

  /** Indicators **/
  postIndicator(indicator: Indicator) {
    return this.http.post(this.base + '/indicator', indicator, this.options);
  }
  /** Indicators **/

  // groupServicesOfProviderPerPlace(id: string) {
  //   return this.getServicesOfferedByProvider(id).subscribe(res => {
  //     const servicesGroupedByPlace = {};
  //     for (const service of res) {
  //       for (const place of service.places) {
  //         if (servicesGroupedByPlace[place]) {
  //           servicesGroupedByPlace[place].push(res);
  //         } else {
  //           servicesGroupedByPlace[place] = [];
  //         }
  //       }
  //     }
  //     return servicesGroupedByPlace;
  //   });
  // }

  getProvidersNames() {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    return this.http.get<Paging<Provider>>(this.base + `/provider/all/`, {params, withCredentials: true});
  }

  getProviders(from: string, quantity: string) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('orderField', 'creation_date');
    params = params.append('order', 'desc');
    return this.http.get(this.base + `/provider/all`, {params});
    // return this.getAll("provider");
  }

  getProviderBundles(from: string, quantity: string, orderField: string, order: string, query: string, status: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('orderField', orderField);
    params = params.append('order', order);
    if (query && query !== '') {
      params = params.append('query', query);
    }
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    }
    return this.http.get(this.base + `/provider/bundle/all`, {params});
    // return this.getAll("provider");
  }

  getResourceBundles(from: string, quantity: string, orderField: string, order: string, query: string, active: string, resource_organisation: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('orderField', orderField);
    params = params.append('order', order);
    // params = params.append('active', active);
    if (query && query !== '') {
      params = params.append('query', query);
    }
    if (active && active !== '') {
      params = params.append('active', active);
    }
    if (resource_organisation && resource_organisation.length > 0) {
      for (const providerValue of resource_organisation) {
        params = params.append('resource_organisation', providerValue);
      }
    }
    return this.http.get(this.base + `/service/adminPage/all`, {params});
    // return this.getAll("provider");
  }

  getMyServiceProviders() {
    return this.http.get<Provider[]>(this.base + '/provider/getMyServiceProviders');
  }

  getEU() {
    return this.http.get(this.base + '/vocabulary/countries/EU');
  }

  getWW() {
    return this.http.get(this.base + '/vocabulary/countries/WW');
  }

  // this should be somewhere else, I think
  expandRegion(places, eu, ww) {
    const iEU = places.indexOf('EU');
    if (iEU > -1) {
      places.splice(iEU, 1);
      places.push(...eu);
    }
    const iWW = places.indexOf('WW');
    if (iWW > -1) {
      places.splice(iWW, 1);
      places.push(...ww);
    }
    return places;
  }

  postService(service: object) {

    return this.http.post<Service>(this.base + '/services', service[Object.keys(service)[0]], this.options);
  }

  uploadServiceWithMeasurements(service: Service, measurements: Measurement[]) {
    return this.http.put<Service>(this.base + '/service/serviceWithMeasurements', {service, measurements}, this.options);
  }

  uploadPendingService(service: Service, shouldPut: boolean) {
    return this.http.put<Service>(this.base + '/pendingService/transform/resource', service, this.options);
  }

  uploadTempPendingService(service: Service) {
    return this.http.put<Service>(this.base + '/pendingService/pending', service, this.options);
  }

  uploadTempService(service: Service) {
    return this.http.put<Service>(this.base + '/pendingService/service', service, this.options);
  }

  getFeaturedServices() {
    return this.http.get<Service[]>(this.base + `/service/featured/all/`);
  }

  getServiceHistory(serviceId: string) {
    return this.http.get<Paging<ServiceHistory>>(this.base + `/service/history/${serviceId}/`);
  }

  getInfo() {
    return this.http.get<Info>(this.base + `/info/all`);
  }

  public handleError(error: HttpErrorResponse) {
    // const message = 'Server error';
    const message = error.error;
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    UIkit.notification.closeAll();
    UIkit.notification({message: message, status: 'danger', pos: 'top-center', timeout: 5000});
    return throwError(error);
  }
}
