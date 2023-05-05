import {Component, Input, OnInit} from '@angular/core';
import {Bundle, Datasource, ProviderBundle, Service, Vocabulary} from '../../../../entities/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {Paging} from '../../../../entities/paging';
import {URLParameter} from '../../../../entities/url-parameter';
import {zip} from 'rxjs/internal/observable/zip';
import {ResourceService} from '../../../../services/resource.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-provider-services',
  templateUrl: 'provider-services.component.html'
})

export class ProviderServicesComponent implements OnInit {

  @Input() providerBundle: ProviderBundle = null

  services: Paging<Bundle<Service | Datasource>> = null;
  vocabularies: Vocabulary[] = null;
  queryParams: URLParameter[] = []

  // Paging
  pages: number[] = [];
  offset = 2;
  pageSize = 9;
  totalPages = 0;
  currentPage = 0;

  // Filter
  order: string = null;
  activeStatus: string = '';
  status: string = '';

  constructor(private providerService: ServiceProviderService, private resourceService: ResourceService, private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      let found = false;
      this.queryParams.splice(0, this.queryParams.length);
      for (const obj in params) {
        if (params.hasOwnProperty(obj)) {
          if (obj === 'quantity')
            found = true;
          const urlParameter: URLParameter = {
            key: obj,
            values: params[obj].split(',')
          };
          this.queryParams.push(urlParameter);
        }
      }
      if (!found) {
        this.updateURLParameters('quantity', this.pageSize);
      }

      this.providerService.getServicesOfProvider(this.providerBundle.provider.id, this.queryParams).subscribe(
        res => {this.services = res;},
        error => {console.error(error)},
        () => {this.paginationInit()}
      );

    });

    zip(
      this.resourceService.getNewVocabulariesByType('Users'),
      this.resourceService.getNewVocabulariesByType('Portfolios')).subscribe(
      value => {
        this.vocabularies = value[0].concat(value[1]);
        // this.loading = false;
      },
      error => {console.log(error);}
    );
  }

  /** Handle query params and navigation ---------------> **/
  updateURLParameters(key, value) {
    for (const urlParameter of this.queryParams) {
      if (urlParameter.key === key) {
        urlParameter.values = [value];
        return;
      }
    }
    this.queryParams.push({key: key, values: [value]});
  }

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.queryParams) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    return this.router.navigate(['/provider/openaire/dashboard/services'], {queryParams: map});
  }
  /** <--------------- Handle query params and navigation **/

  /** Pagination and Paging navigation -------------> **/
  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.totalPages = Math.ceil(this.services.total/this.pageSize);
    this.currentPage = Math.ceil(this.services.from/this.pageSize) + 1;
    this.pages = [];
    for (let i = (+this.currentPage - this.offset); i < (+this.currentPage + 1 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > this.totalPages ) { addToStartCounter++; }
      if ((i >= 1) && (i <= this.totalPages)) {
        this.pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (this.pages.length < this.totalPages) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1 );
      }
    }
  }

  goToPage(page: number) {
    this.updateURLParameters('from', (page) * this.pageSize);
    return this.navigateUsingParameters();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateURLParameters('from', (this.currentPage-1)*this.pageSize);
      this.navigateUsingParameters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateURLParameters('from', (this.currentPage-1)*this.pageSize);
      this.navigateUsingParameters();
    }
  }

  filterSelection(key: string, value: string | string[]) {
    this.updateURLParameters(key, value);
    this.updateURLParameters('from', '0');
    return this.navigateUsingParameters();
  }

  /** <------------- Pagination and Paging navigation **/

  getVocabularyName(id: string) {
    for (const vocabulary of this.vocabularies) {
      if (vocabulary.id === id) {
        return vocabulary.name;
      }
    }
  }

  getPayload(bundle : Bundle<Service | Datasource>): Service | Datasource {
    return bundle.service != null ? bundle.service : bundle.datasource;
  }
}
