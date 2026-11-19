import {ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {EMPTY, Subject, zip} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {Datasource, Service, Vocabulary} from '../../entities/eic-model';
import {Paging} from '../../entities/paging';
import {ResourceService} from '../../services/resource.service';
import {ComparisonService} from '../../services/comparison.service';
import {PremiumSortFacetsPipe} from '../../shared/pipes/premium-sort.pipe';
import {canEditOpenAireServices} from '../../shared/can-edit-openaire-services';
import {HelpContentComponent, AsideHelpContentComponent} from '../../shared/reusablecomponents/help-content.component';
import {ReadMoreComponent} from '../../shared/reusablecomponents/read-more.component';
import {EmailModalComponent} from '../../shared/email-modal/email-modal.component';
import {environment} from '../../../environments/environment';
import {checkSelectedFacets, paging, SearchParameters} from './search-state';

@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HelpContentComponent, FormsModule, ReadMoreComponent, RouterLink, AsideHelpContentComponent, EmailModalComponent]
})
export class SearchAireComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private resourceService = inject(ResourceService);
  readonly comparisonService = inject(ComparisonService);

  readonly projectName = environment.projectName;
  readonly canAddOrEditService = canEditOpenAireServices();
  readonly listViewActive = true;
  /** Never filled on this page, so the email modal and its button stay unused. */
  readonly serviceIdsArray: string[] = [];
  readonly errorMessage: string | null = null;
  readonly pageSize = 10;

  /** The search box; what the user types reaches the URL after a 500 ms pause. */
  readonly searchQuery = signal('');
  readonly typed = new Subject<string>();

  /** The filters of the current query string, which the page edits before it navigates. */
  private parameters = SearchParameters.fromQueryParams({});
  private readonly parameters$ = this.route.queryParams.pipe(
    map(params => this.parameters = SearchParameters.fromQueryParams(params)),
    shareReplay({bufferSize: 1, refCount: true})
  );

  /** True while the vocabularies load again, on every query; they name the portfolios and user types. */
  readonly loading = signal(false);
  readonly vocabularies = toSignal(this.parameters$.pipe(
    tap(() => this.loading.set(true)),
    switchMap(() => zip(
      this.resourceService.getNewVocabulariesByType('Users'),
      this.resourceService.getNewVocabulariesByType('Portfolios')
    ).pipe(catchError(error => {
      console.log(error);
      return EMPTY;
    }))),
    map(([users, portfolios]) => users.concat(portfolios)),
    tap(() => this.loading.set(false))
  ), {initialValue: null as Vocabulary[] | null});

  /** The results of the current query, with the facet values it selects ticked; null before the first. */
  readonly results = toSignal(this.parameters$.pipe(
    switchMap(parameters => this.resourceService.searchWithDatasource([...parameters.all]).pipe(
      map(results => {
        if (results.results.length > 0) {
          new PremiumSortFacetsPipe().transform(results.facets, ['portfolios', 'users', 'trl', 'lifeCycleStatus', 'resourceOrganisation']);
        }
        checkSelectedFacets(results.facets, parameters);
        return results;
      }),
      catchError(() => EMPTY)
    ))
  ), {initialValue: null as Paging<Service | Datasource> | null});

  readonly paging = computed(() => {
    const results = this.results();
    return results ? paging(results.total, results.from, this.pageSize) : {pages: [] as number[], totalPages: 0, currentPage: 0};
  });
  /** Moves at once on previous and next, before the next results arrive, as before. */
  readonly currentPage = linkedSignal(() => this.paging().currentPage);

  constructor() {
    this.typed.pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed()).subscribe(text => {
      this.parameters.set('query', text);
      this.navigate();
    });
  }

  private navigate() {
    return this.router.navigate(['/search/'], {queryParams: this.parameters.toQueryParams()});
  }

  goToPage(page: number) {
    this.parameters.set('from', page * this.pageSize);
    return this.navigate();
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.parameters.set('from', (this.currentPage() - 1) * this.pageSize);
      this.navigate();
    }
  }

  nextPage() {
    if (this.currentPage() < this.paging().totalPages) {
      this.currentPage.update(page => page + 1);
      this.parameters.set('from', (this.currentPage() - 1) * this.pageSize);
      this.navigate();
    }
  }

  clearSelections(event: Event, category: string) {
    this.parameters.remove(category);
    return this.navigate();
  }

  onSelection(event: Event, category: string, value: string) {
    if ((event.target as HTMLInputElement).checked) {
      this.parameters.addValue(category, value);
    } else {
      this.parameters.removeValue(category, value);
    }
    return this.navigate();
  }

  getVocabularyName(id: string) {
    return this.vocabularies()?.find(vocabulary => vocabulary.id === id)?.name;
  }
}
