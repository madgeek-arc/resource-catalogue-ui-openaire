import {ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal, Signal} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NgSelectComponent, NgOptionComponent} from '@ng-select/ng-select';
import {BehaviorSubject, combineLatest, EMPTY, zip} from 'rxjs';
import {catchError, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {Bundle, Datasource, ProviderBundle, Service} from '../../../../entities/eic-model';
import {plainStatuses} from '../../../../entities/bundle-status';
import {ProviderService} from '../../../../services/provider.service';
import {ResourceService} from '../../../../services/resource.service';
import {paging, SearchParameters} from '../../../search/search-state';
import {HttpErrorResponse} from '@angular/common/http';
import {apiErrorMessage} from '../../../../shared/api-error-message';

@Component({
  selector: 'app-provider-services',
  templateUrl: 'provider-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgSelectComponent, FormsModule, NgOptionComponent, RouterLink, DatePipe]
})
export class ProviderServicesComponent {
  private providerService = inject(ProviderService);
  private resourceService = inject(ResourceService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** ProviderDashboardComponent passes the provider through its router outlet, which it only shows once the provider has loaded. */
  readonly bundle = inject(ROUTER_OUTLET_DATA) as Signal<ProviderBundle>;

  readonly pageSize = 9;
  readonly loadingMessage = '';

  /** The filters, shown in the selects; each takes the value of the query string when it has one. */
  readonly order = signal<string | null>(null);
  readonly activeStatus = signal<string | null>(null);
  readonly status = signal<string | null>(null);

  readonly selectedService = signal<Bundle<Service | Datasource> | null>(null);
  readonly showLoader = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** The filters of the current query string, which the page edits before it navigates. */
  private parameters = SearchParameters.fromQueryParams({});
  private readonly reload = new BehaviorSubject<void>(undefined);

  /** The provider's services for the current filters and page; null until they have loaded. */
  readonly services = toSignal(combineLatest([
    toObservable(this.bundle).pipe(map(bundle => bundle?.provider.id), filter((id): id is string => !!id), distinctUntilChanged()),
    this.route.queryParams.pipe(map(params => this.readParameters(params))),
    this.reload
  ]).pipe(
    switchMap(([providerId, parameters]) => this.providerService.getServicesOfProvider(providerId, [...parameters.all]).pipe(
      catchError(error => {
        console.error(error);
        return EMPTY;
      })
    ))
  ), {initialValue: null});

  readonly paging = computed(() => {
    const services = this.services();
    return services ? paging(services.total, services.from, this.pageSize) : {pages: [] as number[], totalPages: 0, currentPage: 0};
  });
  /** Moves at once on previous and next, before the next page arrives, as before. */
  readonly currentPage = linkedSignal(() => this.paging().currentPage);

  readonly vocabularies = toSignal(zip(
    this.resourceService.getNewVocabulariesByType('Users'),
    this.resourceService.getNewVocabulariesByType('Portfolios'),
    this.resourceService.getNewVocabulariesByType('Resource state')
  ).pipe(
    map(([users, portfolios, resourceState]) => ({names: users.concat(portfolios), resourceState: plainStatuses(resourceState)})),
    catchError(error => {
      console.error(error);
      return EMPTY;
    })
  ), {initialValue: null});

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
      value = (value as Record<string, unknown>)['$ngOptionValue'];
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
      this.updateURLParameters('sort', null);
    }
    this.updateURLParameters(key, value);
    this.updateURLParameters('from', '0');
    return this.navigate();
  }

  toggleServiceActive(bundle: Bundle<Service | Datasource>) {
    if (bundle.status === 'pending' || bundle.status === 'rejected') {
      this.errorMessage.set(`You cannot activate a ${bundle.status} resource.`);
      window.scrollTo(0, 0);
      return;
    }
    this.errorMessage.set(null);
    this.showLoader.set(true);
    this.resourceService.publishService(bundle.id, !bundle.active).subscribe({
      error: (error: HttpErrorResponse) => {
        this.showLoader.set(false);
        this.errorMessage.set(apiErrorMessage(error, bundle.active ? 'Deactivating failed' : 'Activating failed'));
      },
      complete: () => {
        this.showLoader.set(false);
        this.reload.next();
      }
    });
  }

  showDeletionModal(bundle: Bundle<Service | Datasource>) {
    this.selectedService.set(bundle);
    if (bundle) {
      UIkit.modal('#deletionModal').show();
    }
  }

  deleteService(bundle: Bundle<Service | Datasource>) {
    this.errorMessage.set(null);
    this.showLoader.set(true);
    this.resourceService.deleteService(bundle.id).subscribe({
      error: (error: HttpErrorResponse) => {
        this.showLoader.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Deleting failed'));
      },
      complete: () => window.location.reload()
    });
  }

  getVocabularyName(id: string) {
    return this.vocabularies()?.names.find(vocabulary => vocabulary.id === id)?.name;
  }

  getPayload(bundle: Bundle<Service | Datasource>): Service | Datasource {
    return bundle.service != null ? bundle.service : bundle.datasource;
  }
}
