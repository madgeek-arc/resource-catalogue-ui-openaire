import {Component, OnInit} from '@angular/core';
import {Provider, Snippet} from '../../entities/eic-model';
import {URLParameter} from '../../entities/url-parameter';
import {Paging, SpringPaging} from '../../entities/paging';
import {PremiumSortFacetsPipe} from '../../shared/pipes/premium-sort.pipe';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute} from '@angular/router';
import {ResourceService} from '../../services/resource.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ComparisonService} from '../../services/comparison.service';
import {Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html',
  // styleUrls: ['../../../lib/pages/search/search.component.css']
})
export class SearchAireComponent implements OnInit {
  public projectName = environment.projectName;
  canAddOrEditService: boolean;
  myProviders:  Provider[] = [];
  searchResultsSnippets: SpringPaging<Snippet> = new SpringPaging<Snippet>();
  private sortFacets = new PremiumSortFacetsPipe();
  advanced = false;
  listViewActive = true;
  public showSearchFieldDropDown = true;
  public searchFields: string[] = ['name', 'description', 'tagline', 'user value', 'user base', 'use cases'];
  public serviceIdsArray: string[] = [];

  // Paging
  total: number;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;
  pageSize = 10;
  totalPages = 0;
  isPreviousPageDisabled = false;
  isFirstPageDisabled = false;
  isNextPageDisabled = false;
  isLastPageDisabled = false;

  public searchForm: FormGroup;
  errorMessage: string;
  filtersMobileShown = false;
  sub: Subscription;
  urlParameters: URLParameter[] = [];
  foundResults = true;
  loading = false;


  constructor(public fb: FormBuilder, public router: NavigationService, public route: ActivatedRoute,
              public resourceService: ResourceService, public authenticationService: AuthenticationService,
              public comparisonService: ComparisonService) {
    this.searchForm = fb.group({'query': [''], 'searchFields': ['']});
  }

  ngOnInit() {
    this.listViewActive = true;
    this.sub = this.route.queryParams.subscribe(params => {
      this.urlParameters.splice(0, this.urlParameters.length);
      this.foundResults = true;
      for (const obj in params) {
        if (params.hasOwnProperty(obj)) {
          const urlParameter: URLParameter = {
            key: obj,
            values: params[obj].split(',')
          };
          this.urlParameters.push(urlParameter);
        }
      }

      // request results from the registry
      // this.loading = true; // Uncomment for spinner
      return this.resourceService.searchSnippets(this.urlParameters).subscribe(
        searchResults => {
          this.updateSearchResultsSnippets(searchResults);
        },
        error => {},
        () => {
          this.paginationInit();
          this.loading = false;
        }
      );
    });

    this.canAddOrEditService = false;
    console.log('is logged in: ' + this.authenticationService.isLoggedIn());
    if (this.authenticationService.isLoggedIn() && this.projectName === 'OpenAIRE Catalogue') {
      console.log('for edit button');
      this.resourceService.getMyServiceProviders().subscribe(
        res => this.myProviders = res,
        er => console.log(er),
        () => this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire')
      );
    }
  }

  updateSearchResultsSnippets(searchResults: SpringPaging<Snippet>) {

    // INITIALISATIONS

    this.errorMessage = null;
    this.searchResultsSnippets = searchResults;
    this.isFirstPageDisabled = false;
    this.isPreviousPageDisabled = false;
    this.isLastPageDisabled = false;
    this.isNextPageDisabled = false;
    if (this.searchResultsSnippets.page.content.length === 0) {
      this.foundResults = false;
    } else {
      this.sortFacets.transform(this.searchResultsSnippets.facets,['portfolios', 'users', 'trl', 'lifeCycleStatus'])
    }
    // update form values using URLParameters
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === 'searchFields') {
        this.searchForm.get('searchFields').setValue(urlParameter.values[0]);
      }
      if (urlParameter.key === 'query') {
        this.searchForm.get('query').setValue(urlParameter.values[0]);
      } else if (urlParameter.key === 'advanced') {
        this.advanced = urlParameter.values[0] === 'true';
      } else {
        for (const facet of this.searchResultsSnippets.facets) {
          if (facet.field === urlParameter.key) {
            //
            for (const parameterValue of urlParameter.values) {
              for (const facetValue of facet.values) {
                if (parameterValue === facetValue.value) {
                  facetValue.isChecked = true;
                }
              }
            }
          }
        }
      }
    }
    this.updatePagingURLParametersQuantity(this.pageSize);
    this.currentPage = this.searchResultsSnippets.page.pageable.pageNumber + 1;
    this.totalPages = Math.ceil(searchResults.page.totalElements / this.pageSize);
    if (this.currentPage === 1) {
      this.isFirstPageDisabled = true;
      this.isPreviousPageDisabled = true;
    }
    if (this.currentPage === this.totalPages) {
      this.isLastPageDisabled = true;
      this.isNextPageDisabled = true;
    }
  }

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    this.currentPage = this.searchResultsSnippets.page.pageable.pageNumber + 1;
    this.pageTotal = this.searchResultsSnippets.page.totalElements;
    for ( let i = (+this.currentPage - this.offset); i < (+this.currentPage + 1 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > this.pageTotal ) { addToStartCounter++; }
      if ((i >= 1) && (i <= this.pageTotal)) {
        this.pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (this.pages.length < this.pageTotal) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1 );
      }
    }
  }

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    // console.log(map);
    return this.router.search(map);
  }

  updatePagingURLParameters(from: number) {
    let foundFromCategory = false;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === 'from') {
        foundFromCategory = true;
        urlParameter.values = [];
        urlParameter.values.push(from + '');
        break;
      }
    }
    if (!foundFromCategory) {
      const newFromParameter: URLParameter = {
        key: 'from',
        values: [from + '']
      };
      this.urlParameters.push(newFromParameter);
    }
  }

  updatePagingURLParametersQuantity(quantity: number) {
    let foundQuantityCategory = false;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === 'quantity') {
        foundQuantityCategory = true;
        urlParameter.values = [];
        urlParameter.values.push(quantity + '');
      }
    }
    if (!foundQuantityCategory) {
      const newQuantityParameter: URLParameter = {
        key: 'quantity',
        values: [quantity + '']
      };
      this.urlParameters.push(newQuantityParameter);
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    let from: number = (this.currentPage - 1) * this.pageSize
    this.updatePagingURLParameters(from);
    return this.navigateUsingParameters();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      let from: number = this.currentPage * this.pageSize;
      from -= this.pageSize;
      this.updatePagingURLParameters(from);
      return this.navigateUsingParameters();
    }
  }

  nextPage() {
    if (this.currentPage < this.pageTotal) {
      this.currentPage++;
      let from: number = this.currentPage * this.pageSize;
      from += this.pageSize;
      this.updatePagingURLParameters(from);
      return this.navigateUsingParameters();
    }
  }

  showFiltersMobile(show: boolean) {
    this.filtersMobileShown = show;
  }

  onSubmit(searchValue: string) {
    /*let params = Object.assign({},this.activatedRoute.children[0].snapshot.params);
    params['query'] = searchValue.query;*/
    searchValue = searchValue.replace(/[;=]/g, '');
    let url = window.location.href;
    let params: String[] = url.split(';');
    if (params.length > 1) {
      // let query: String[] = params[1].split('=');
      let query: String[];
      for (const i of params) {
        query = i.split('=');
        if (query[0] === 'query') {
          query[1] = searchValue;
          params[1] = query.join('=');
          params = params.slice(1);
          url = params.join(';');
          this.router.searchParams.next({query: searchValue});
          return window.location.href = '/search;' + url;
        }
      }
      params.splice(1, 0, `query=${searchValue}`);
      params = params.slice(1);
      url = params.join(';');
      this.router.searchParams.next({query: searchValue});
      return window.location.href = '/search;' + url;
    } else {
      return this.router.search({query: searchValue});
    }
  }

  updateSearchField(event) {
    const map: { [name: string]: string; } = {};
    const params = this.route.snapshot.params;
    let found = false;
    this.urlParameters = [];
    for (const i in params) {
      if (params.hasOwnProperty(i)) {
        if (i === 'searchFields') {
          found = true;
          if (event.target.value === '') {
            continue;
          } else {
            this.urlParameters.push({key: i, values: [event.target.value]});
            continue;
          }
        }
        this.urlParameters.push({key: i, values: [params[i]]});
      }
    }
    if (!found) {
      this.urlParameters.push({key: 'searchFields', values: [event.target.value]});
    }
    for (const urlParameter of this.urlParameters) {
      let concatValue = '';
      let counter = 0;
      for (const value of urlParameter.values) {
        if (counter !== 0) {
          concatValue += ',';
        }
        concatValue += value;
        counter++;
      }
      map[urlParameter.key] = concatValue;
    }
    return this.router.search(map);
  }

  clearSelections(e, category: string) {
    let categoryIndex = 0;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === category) {
        console.log(urlParameter);
        this.urlParameters.splice(categoryIndex, 1);
      }
      categoryIndex++;
    }
    return this.navigateUsingParameters();
  }

  onSelection(e, category: string, value: string) {
    if (e.target.checked) {
      this.addParameterToURL(category, value);
    } else {
      let categoryIndex = 0;
      for (const urlParameter of this.urlParameters) {
        if (urlParameter.key === category) {
          const valueIndex = urlParameter.values.indexOf(value, 0);
          if (valueIndex > -1) {
            urlParameter.values.splice(valueIndex, 1);
            if (urlParameter.values.length === 0) {
              this.urlParameters.splice(categoryIndex, 1);
            }
          }
        }
        categoryIndex++;
      }
    }
    return this.navigateUsingParameters();
  }

  private addParameterToURL(category: string, value: string) {
    let foundCategory = false;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === category) {
        foundCategory = true;
        const valueIndex = urlParameter.values.indexOf(value, 0);
        if (valueIndex < 0) {
          urlParameter.values.push(value);
          this.updatePagingURLParameters(0);
        }
      }
    }
    if (!foundCategory) {
      this.updatePagingURLParameters(0);
      const newParameter: URLParameter = {
        key: category,
        values: [value]
      };
      this.urlParameters.push(newParameter);
    }
  }

}
