import {Component, OnInit} from '@angular/core';
import {SearchComponent} from 'src/lib/pages/search/search.component';
import {Provider, RichService, Snippet} from 'src/lib/domain/eic-model';
import {zip} from 'rxjs/internal/observable/zip';
import {URLParameter} from '../../../lib/domain/url-parameter';
import {Paging} from '../../../lib/domain/paging';
import {PremiumSortFacetsPipe} from '../../../lib/shared/pipes/premium-sort.pipe';


@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html',
  styleUrls: ['../../../lib/pages/search/search.component.css']
})
export class SearchAireComponent extends SearchComponent implements OnInit {
  canAddOrEditService: boolean;
  myProviders:  Provider[] = [];
  searchResultsSnippets: Paging<Snippet>;

  ngOnInit() {
    // super.ngOnInit();
    this.listViewActive = true;
    this.sub = this.route.params.subscribe(params => {
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
      this.loading = true;
      return this.resourceService.searchSnippets(this.urlParameters).subscribe(
        searchResults => {
          this.updateSearchResultsSnippets(searchResults);
        },
        error => {},
        () => {
          this.loading = false;
        }
      );
    });

    this.canAddOrEditService = false;
    if (this.authenticationService.isLoggedIn() && this.projectName === 'OpenAIRE Catalogue') {
      this.resourceService.getMyServiceProviders().subscribe(
        res => this.myProviders = res,
        er => console.log(er),
        () => this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire')
      );
    }
  }

  updateSearchResultsSnippets(searchResults: Paging<Snippet>) {

    // INITIALISATIONS
    const sortLanguages = new PremiumSortFacetsPipe();
    this.errorMessage = null;
    this.searchResultsSnippets = searchResults;
    this.isFirstPageDisabled = false;
    this.isPreviousPageDisabled = false;
    this.isLastPageDisabled = false;
    this.isNextPageDisabled = false;
    if (this.searchResultsSnippets.results.length === 0) {
      this.foundResults = false;
    } else {
      for (let i = 0; i < this.searchResultsSnippets.facets.length; i++) {
        if (this.searchResultsSnippets.facets[i].label === 'Language') {
          sortLanguages.transform(this.searchResultsSnippets.facets[i].values, ['English']);
        } else {
          this.searchResultsSnippets.facets[i].values.sort((a, b) => 0 - (a.label > b.label ? -1 : 1));
        }
      }
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
    this.currentPage = (searchResults.from / this.pageSize) + 1;
    this.totalPages = Math.ceil(searchResults.total / this.pageSize);
    if (this.currentPage === 1) {
      this.isFirstPageDisabled = true;
      this.isPreviousPageDisabled = true;
    }
    if (this.currentPage === this.totalPages) {
      this.isLastPageDisabled = true;
      this.isNextPageDisabled = true;
    }
  }
}
