import {Component, OnInit} from '@angular/core';
import {Provider, Snippet} from '../../entities/eic-model';
import {URLParameter} from '../../entities/url-parameter';
import {Paging, SpringPaging} from '../../entities/paging';
import {PremiumSortFacetsPipe} from '../../shared/pipes/premium-sort.pipe';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../services/resource.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ComparisonService} from '../../services/comparison.service';
import {Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html'
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
  pages: number[] = [];
  offset = 2;

  public searchForm: FormGroup;
  errorMessage: string;
  filtersMobileShown = false;
  urlParameters: URLParameter[] = [];
  loading = false;


  constructor(public fb: FormBuilder, public router: Router, public route: ActivatedRoute,
              public resourceService: ResourceService, public authenticationService: AuthenticationService,
              public comparisonService: ComparisonService) {
    this.searchForm = fb.group({'query': [''], 'searchFields': ['']});
  }

  ngOnInit() {
    this.listViewActive = true;
    this.route.queryParams.subscribe(params => {
      this.urlParameters.splice(0, this.urlParameters.length);
      for (const obj in params) {
        if (params.hasOwnProperty(obj)) {
          const urlParameter: URLParameter = {
            key: obj,
            values: params[obj].split(',')
          };
          this.urlParameters.push(urlParameter);
        }
      }

      this.loading = true; // Uncomment for spinner
      this.resourceService.search(this.urlParameters).subscribe(
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
      this.myProviders = [];
      this.resourceService.getMyServiceProviders().subscribe(
        res => this.myProviders = res,
        error => console.log(error),
        () => this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire')
      );
    }
  }

  updateSearchResultsSnippets(searchResults: SpringPaging<Snippet>) {
    // INITIALISATIONS
    this.errorMessage = null;
    this.searchResultsSnippets = searchResults;

    if (!this.searchResultsSnippets.page.empty ) {
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
    this.updateURLParameters('size', this.searchResultsSnippets.page.size);
  }

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    for ( let i = (+this.searchResultsSnippets.page.number + 1 - this.offset); i < (+this.searchResultsSnippets.page.number + 2 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > this.searchResultsSnippets.page.totalPages ) { addToStartCounter++; }
      if ((i >= 1) && (i <= this.searchResultsSnippets.page.totalPages)) {
        this.pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (this.pages.length < this.searchResultsSnippets.page.totalPages) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1 );
      }
    }
  }

  updateURLParameters(key, value) {
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === key) {
        urlParameter.values = [value];
        return;
      }
    }
    this.urlParameters.push({key: key, values: [value]});
  }

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    return this.router.navigate([`/search/`], {queryParams: map});
  }


  goToPage(page: number) {
    this.updateURLParameters('page', page);
    return this.navigateUsingParameters();
  }

  previousPage() {
    if (this.searchResultsSnippets.page.number > 0) {
      this.updateURLParameters('page', this.searchResultsSnippets.page.number - 1);
      this.navigateUsingParameters();
    }
  }

  nextPage() {
    if (this.searchResultsSnippets.page.number + 1 < this.searchResultsSnippets.page.totalPages) {
      this.updateURLParameters('page', this.searchResultsSnippets.page.number + 1);
      this.navigateUsingParameters();
    }
  }

  showFiltersMobile(show: boolean) {
    this.filtersMobileShown = show;
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
          this.updateURLParameters('page', 0);
        }
      }
    }
    if (!foundCategory) {
      this.updateURLParameters('page', 0);
      const newParameter: URLParameter = {
        key: category,
        values: [value]
      };
      this.urlParameters.push(newParameter);
    }
  }

}
