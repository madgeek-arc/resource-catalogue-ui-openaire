import {Component, OnInit} from '@angular/core';
import {SearchComponent} from 'src/lib/pages/search/search.component';
import {Provider, RichService, Snippet} from 'src/lib/domain/eic-model';
import {URLParameter} from '../../../lib/domain/url-parameter';
import {Paging} from '../../../lib/domain/paging';
import {PremiumSortFacetsPipe} from '../../../lib/shared/pipes/premium-sort.pipe';
import {FormModel, UiVocabulary} from '../../../lib/domain/dynamic-form-model';
import {zip} from 'rxjs/internal/observable/zip';


@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html',
  // styleUrls: ['../../../lib/pages/search/search.component.css']
})
export class SearchAireComponent extends SearchComponent implements OnInit {
  canAddOrEditService: boolean;
  myProviders:  Provider[] = [];
  searchResultsSnippets: Paging<Snippet>;
  private sortFacets = new PremiumSortFacetsPipe();
  model: FormModel[] = null;
  vocabularies: Map<string, UiVocabulary[]>;

  //Paging
  total: number;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  ngOnInit() {
    // super.ngOnInit();
    this.listViewActive = true;
    this.sub = this.route.params.subscribe(params => {
      zip(
        this.formService.getFormModel(),
        this.formService.getUiVocabularies()
      ).subscribe(suc => {
        this.model = <FormModel[]>suc[0];
        this.vocabularies = <Map<string, UiVocabulary[]>>suc[1];
      });
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
          this.paginationInit();
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

    this.errorMessage = null;
    this.searchResultsSnippets = searchResults;
    this.searchResultsSnippets.facets.sort();
    this.isFirstPageDisabled = false;
    this.isPreviousPageDisabled = false;
    this.isLastPageDisabled = false;
    this.isNextPageDisabled = false;
    if (this.searchResultsSnippets.results.length === 0) {
      this.foundResults = false;
    } else {
      this.sortFacets.transform(this.searchResultsSnippets.facets,['Portfolios', 'Users', 'TRL', 'Life Cycle Status'])
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

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    this.currentPage = (this.searchResultsSnippets.from / this.pageSize) + 1;
    this.pageTotal = Math.ceil(this.searchResultsSnippets.total / this.pageSize);
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

  getCompositeVocName(field: string, id: string): string {
    for (let k = 0; k < this.vocabularies[field].length; k++) {
      if (this.vocabularies[field][k].id === id) {
        return (this.vocabularies[field][k].name);
      }
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
      let from: number = this.searchResultsSnippets.from;
      from -= this.pageSize;
      this.updatePagingURLParameters(from);
      return this.navigateUsingParameters();
    }
  }

  nextPage() {
    if (this.currentPage < this.pageTotal) {
      this.currentPage++;
      let from: number = this.searchResultsSnippets.from;
      from += this.pageSize;
      this.updatePagingURLParameters(from);
      return this.navigateUsingParameters();
    }
  }

}
