import {ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {EMPTY, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {DatasourceService} from '../../../services/datasource.service';
import {PremiumSortFacetsPipe} from '../../../shared/pipes/premium-sort.pipe';
import {HelpContentComponent, AsideHelpContentComponent} from '../../../shared/reusablecomponents/help-content.component';
import {ReadMoreComponent} from '../../../shared/reusablecomponents/read-more.component';
import {environment} from '../../../../environments/environment';
import {checkSelectedFacets, paging, SearchParameters} from '../search-state';

@Component({
  selector: 'app-search',
  templateUrl: './datasourceSearch.component.html',
  providers: [DatasourceService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HelpContentComponent, FormsModule, RouterLink, AsideHelpContentComponent, ReadMoreComponent]
})
export class DatasourceSearchComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private datasourceService = inject(DatasourceService);

  readonly projectName = environment.projectName;
  readonly errorMessage: string | null = null;
  readonly loading = false;
  readonly pageSize = 20;

  /** The search box and the selects; each takes the value of the query string when results arrive. */
  readonly searchQuery = signal('');
  readonly eoscDatasourceType = signal('');
  readonly orderField = signal('registrationdate');
  readonly order = signal('desc');
  readonly typed = new Subject<string>();

  /** The filters of the current query string, which the page edits before it navigates. */
  private parameters = SearchParameters.fromQueryParams({});

  readonly datasourceTypes = toSignal(this.datasourceService.getDatasourceTypes().pipe(
    catchError(error => {
      console.error(error);
      return EMPTY;
    })
  ), {initialValue: null});

  /** The results of the current query, with the facet values it selects ticked; null before the first. */
  readonly results = toSignal(this.route.queryParams.pipe(
    map(params => this.parameters = SearchParameters.fromQueryParams(params)),
    switchMap(parameters => this.datasourceService.getDatasources([...parameters.all]).pipe(
      map(results => {
        if (results.results.length > 0) {
          new PremiumSortFacetsPipe().transform(results.facets, ['portfolios', 'users', 'trl', 'lifeCycleStatus']);
        }
        this.showParameters(parameters);
        checkSelectedFacets(results.facets, parameters);
        return results;
      }),
      catchError(() => EMPTY)
    ))
  ), {initialValue: null});

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

  private showParameters(parameters: SearchParameters) {
    const fields = [['eoscDatasourceType', this.eoscDatasourceType], ['orderField', this.orderField], ['order', this.order], ['query', this.searchQuery]] as const;
    for (const [key, field] of fields) {
      const value = parameters.value(key);
      if (value !== undefined) {
        field.set(value);
      }
    }
  }

  private navigate() {
    return this.router.navigate(['/datasources/search'], {queryParams: this.parameters.toQueryParams()});
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

  onSelect(key: string, value: string) {
    this.parameters.set(key, value);
    return this.navigate();
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
}
