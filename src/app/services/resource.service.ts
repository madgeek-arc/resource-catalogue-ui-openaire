import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Provider, Service, ServiceHistory, Vocabulary, Type, Datasource} from '../entities/eic-model';
import {Paging,} from '../entities/paging';
import {URLParameter} from '../entities/url-parameter';
import {PortfolioMap, ServiceSnippet} from '../entities/portfolioMap';


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

  getResource(resourceId: string) {
    return this.http.get<Service>(this.base + `/services/${resourceId}`, this.options);
  }

  getServiceOrDatasource(resourceId: string) {
    return this.http.get<Service | Datasource>(this.base + `/catalogue-resources/${resourceId}`, this.options);
  }

  search(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    return this.http.get<Paging<Service>>(this.base + `/services?${searchQuery.toString()}`, this.options);
  }

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
    return this.http.get<Paging<Service | Datasource>>(this.base + `/catalogue-resources`, {params: searchQuery});
  }

  getServicesSnippetByUserContentAndPortfolioType(userType: string, portfolioType?: string) {
    const url = (portfolioType ? `/services?quantity=100&users=${userType}&portfolios=${portfolioType}` : `/services?quantity=100&users=${userType}`);
    return this.http.get<Paging<Service>>(this.base + url, this.options);
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
      return this.http.get<Paging<Service>>(this.base + `/services`, {params});
    } else {
      return this.http.get<Paging<Service>>(this.base + `/services`);
    }
  }

  getServicesByIdArray(idArray: string[]) {
    return this.http.get<Service[]>(this.base + `/services/ids/${idArray.toString()}`);
  }

  getService(id: string, version?: string) {
    // if version becomes optional this should be reconsidered
    return this.http.get<Service>(this.base + `/service/${version === undefined ? id : [id, version].join('/')}`, this.options);
  }

  getResourcesGroupedByField(field: string) {
    return this.http.get<Map<string, Service[] | Datasource[]>>(this.base + `/catalogue-resources/by/${field}`);
  }

  /** STATS **/
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

  getMyServiceProviders() {
    return this.http.get<Provider[]>(this.base + '/providers/my');
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

  postService(service: Service) {
    return this.http.post<Service>(this.base + '/services', service, this.options);
  }

  editService(service: Service) {
    return this.http.put<Service>(this.base + `/services/${service.id}`, service, this.options);
  }

  postDatasource(datasource: Datasource) {
    return this.http.post<Datasource>(this.base + '/services', datasource, this.options);
  }

  editDatasource(datasource: Datasource) {
    return this.http.put<Datasource>(this.base + `/datasources/${datasource.id}`, datasource, this.options);
  }

  getServiceHistory(serviceId: string) {
    return this.http.get<Paging<ServiceHistory>>(this.base + `/service/history/${serviceId}/`);
  }

}
