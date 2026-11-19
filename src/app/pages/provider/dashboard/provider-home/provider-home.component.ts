import {ChangeDetectionStrategy, Component, computed, inject, Signal} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {DatePipe, TitleCasePipe} from '@angular/common';
import {EMPTY, of} from 'rxjs';
import {catchError, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {Datasource, ProviderBundle, Service, ServiceBundle} from '../../../../entities/eic-model';
import {ProviderService} from '../../../../services/provider.service';
import {ResourceService} from '../../../../services/resource.service';

@Component({
  selector: 'app-provider-home',
  templateUrl: 'provider-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TitleCasePipe, DatePipe]
})
export class ProviderHomeComponent {
  private providerService = inject(ProviderService);
  private resourceService = inject(ResourceService);

  /** ProviderDashboardComponent passes the provider through its router outlet; null until it has loaded. */
  private bundle = inject(ROUTER_OUTLET_DATA) as Signal<ProviderBundle | null>;
  readonly currentProvider = computed(() => this.bundle()?.provider ?? null);
  readonly logs = computed(() => this.bundle()?.loggingInfo ?? null);

  readonly vocabularyMap = toSignal(this.resourceService.getUiVocabularies().pipe(
    catchError(() => EMPTY)
  ), {initialValue: null});

  /** The provider's services, newest change first; null until they have loaded. */
  readonly allResources = toSignal(toObservable(this.bundle).pipe(
    map(bundle => bundle?.provider.id),
    filter(id => !!id),
    distinctUntilChanged(),
    switchMap(id => this.providerService.getServicesOfProvider(id, [
      {key: 'orderField', values: ['modifiedAt']}, {key: 'order', values: ['desc']}
    ]).pipe(
      map(paging => paging.results as ServiceBundle[]),
      catchError(error => {
        console.error(error);
        return of(null);
      })
    ))
  ), {initialValue: null});

  readonly approved = computed(() => this.withStatus('approved'));
  readonly pending = computed(() => this.withStatus('pending'));
  readonly rejected = computed(() => this.withStatus('rejected'));

  private withStatus(status: string): ServiceBundle[] | null {
    return this.allResources()?.filter(bundle => bundle.status === status) ?? null;
  }

  getPayload(bundle: ServiceBundle): Service | Datasource {
    return bundle.service != null ? bundle.service : bundle.datasource;
  }

  getVocabularyName(vocabularyType: string, id: string): string {
    return this.vocabularyMap()[vocabularyType].find(vocabulary => vocabulary.id === id)?.name;
  }
}
