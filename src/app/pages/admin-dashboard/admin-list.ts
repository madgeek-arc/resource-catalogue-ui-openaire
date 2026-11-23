import {computed, Directive, inject, linkedSignal, signal, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, combineLatest, EMPTY, Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Bundle, Vocabulary} from '../../entities/eic-model';
import {Paging} from '../../entities/paging';
import {URLParameter} from '../../entities/url-parameter';
import {ResourceService} from '../../services/resource.service';
import {paging, SearchParameters} from '../search/search-state';

declare let UIkit: any;

/**
 * What the admin lists of providers, services and datasources share: the filters and paging in the query string,
 * the page of bundles they select, and the activate, verify and delete actions.
 */
@Directive()
export abstract class AdminListComponent<T extends Bundle<unknown>> {
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private vocabularies = inject(ResourceService);

  readonly pageSize = 9;
  readonly loadingMessage = '';

  /** The filters, shown in the selects; each takes the value of the query string when it has one. */
  readonly order = signal<string | null>(null);
  readonly activeStatus = signal<string | null>('');
  readonly status = signal<string | null>(null);

  readonly selected = signal<T | null>(null);
  readonly showLoader = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** The filters of the current query string, which the page edits before it navigates. */
  private parameters = SearchParameters.fromQueryParams({});
  /** Fetches the current page again, after an action changed what it shows. */
  protected readonly reload = new BehaviorSubject<void>(undefined);

  /** The bundles for the current filters and page; null until they have loaded. */
  abstract readonly list: Signal<Paging<T> | null>;

  readonly paging = computed(() => {
    const list = this.list();
    return list ? paging(list.total, list.from, this.pageSize) : {pages: [] as number[], totalPages: 0, currentPage: 0};
  });
  /** Moves at once on previous and next, before the next page arrives, as before. */
  readonly currentPage = linkedSignal(() => this.paging().currentPage);

  /** For the subclass's `list`: the page that `fetch` returns for the query string, fetched again on each change. */
  protected load(fetch: (parameters: URLParameter[]) => Observable<Paging<T>>): Signal<Paging<T> | null> {
    return toSignal(combineLatest([
      this.route.queryParams.pipe(map(params => this.readParameters(params))),
      this.reload
    ]).pipe(
      switchMap(([parameters]) => fetch([...parameters.all]).pipe(
        catchError(error => {
          console.error(error);
          return EMPTY;
        })
      ))
    ), {initialValue: null});
  }

  /** The vocabulary of a filter select; null until it has loaded, and if it fails. */
  protected vocabulary(type: string): Signal<Vocabulary[] | null> {
    return toSignal(this.vocabularies.getNewVocabulariesByType(type).pipe(
      catchError(error => {
        console.error(error);
        return EMPTY;
      })
    ), {initialValue: null});
  }

  private readParameters(params: Record<string, string>): SearchParameters {
    const parameters = SearchParameters.fromQueryParams(params);
    if (parameters.value('quantity') === undefined) {
      parameters.set('quantity', this.pageSize);
    }
    const shown = [['active', this.activeStatus], ['status', this.status], ['order', this.order]] as const;
    for (const [key, field] of shown) {
      const value = parameters.value(key);
      if (value !== undefined) {
        field.set(value);
      }
    }
    return this.parameters = parameters;
  }

  /** Called by the template too; null removes the parameter, and ng-select option objects give their value. */
  updateURLParameters(key: string, value: unknown) {
    if (value instanceof Object) {
      value = value['$ngOptionValue'];
    }
    if (value === null) {
      this.parameters.remove(key);
    } else {
      this.parameters.set(key, value as string);
    }
  }

  private navigate() {
    return this.router.navigate([], {relativeTo: this.route, queryParams: this.parameters.toQueryParams()});
  }

  goToPage(page: number) {
    this.updateURLParameters('from', page * this.pageSize);
    return this.navigate();
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.updateURLParameters('from', (this.currentPage() - 1) * this.pageSize);
      this.navigate();
    }
  }

  nextPage() {
    if (this.currentPage() < this.paging().totalPages) {
      this.currentPage.update(page => page + 1);
      this.updateURLParameters('from', (this.currentPage() - 1) * this.pageSize);
      this.navigate();
    }
  }

  /** A cleared select passes null, which removes the parameter. */
  filterSelection(key: string, value: string | string[] | null) {
    if (key === 'order' && value === null) {
      this.updateURLParameters('orderField', null);
    }
    this.updateURLParameters(key, value);
    this.updateURLParameters('from', '0');
    return this.navigate();
  }

  /** Approves or rejects a pending bundle, then shows the page again. */
  protected verify(request: Observable<unknown>) {
    request.subscribe({
      next: () => this.reload.next(),
      error: error => console.log(error)
    });
  }

  /** Activates or deactivates an approved bundle with `publish`, then shows the page again. */
  protected toggleActive(bundle: T, publish: (id: string, active: boolean) => Observable<unknown>) {
    if (bundle.status === 'pending' || bundle.status === 'rejected') {
      this.errorMessage.set(`You cannot activate a ${bundle.status}.`);
      window.scrollTo(0, 0);
      return;
    }
    this.showLoader.set(true);
    publish(bundle.id, !bundle.active).subscribe({
      error: error => {
        this.showLoader.set(false);
        this.errorMessage.set('Something went bad. ' + error.error.error);
      },
      complete: () => {
        this.showLoader.set(false);
        this.reload.next();
      }
    });
  }

  showDeletionModal(bundle: T) {
    this.selected.set(bundle);
    if (bundle) {
      UIkit.modal('#deletionModal').show();
    }
  }
}
