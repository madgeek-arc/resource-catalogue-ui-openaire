import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {DatasourceDetails, DatasourceTypes} from '../entities/datasource';
import {URLParameter} from '../entities/url-parameter';
import {Paging} from '../entities/paging';

@Injectable()
export class DatasourceService {
  base: string = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  constructor(private http: HttpClient) {}

  getDatasources(urlParameters: URLParameter[]) {
    let queryParams = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        queryParams = queryParams.append(urlParameter.key, value);
      }
    }

    return this.http.get<Paging<DatasourceDetails>>(this.base + '/dsm/datasources', {params: queryParams});
  }

  getDatasourceById(id) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('id', id);
    return this.http.get<Paging<DatasourceDetails>>(this.base + '/dsm/datasources', {params: queryParams});
  }

  getDatasourceTypes() {
    return this.http.get<DatasourceTypes>('https://api.openaire.eu/vocabularies/dnet:eosc_datasource_types.json');
  }
}
