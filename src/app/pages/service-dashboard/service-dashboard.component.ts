import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink, RouterOutlet} from '@angular/router';
import {EMPTY, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {ResourceService} from '../../services/resource.service';
import {NavigationService} from '../../services/navigation.service';
import {Bundle, Datasource, Service} from '../../entities/eic-model';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet]
})
export class ServiceDashboardComponent {
  private resourceService = inject(ResourceService);
  private navigation = inject(NavigationService);
  private route = inject(ActivatedRoute);

  readonly providerId = this.route.snapshot.paramMap.get('providerId');
  readonly serviceId = this.route.snapshot.paramMap.get('resourceId');

  private readonly resourceId$ = this.route.params.pipe(map(params => params['resourceId'] as string));

  /** The service, also passed to the history pages through the router outlet; undefined until it has loaded. */
  readonly bundle = toSignal(this.resourceId$.pipe(
    switchMap(id => this.resourceService.getServiceOrDatasourceBundle(id).pipe(
      catchError(error => {
        if (error.status === 404) {
          this.navigation.go('/404');
        }
        return EMPTY;
      })
    ))
  ), {initialValue: undefined as Bundle<Service | Datasource> | undefined});

  /** The service's datasource subprofile, if it has one. */
  readonly subprofile = toSignal(this.resourceId$.pipe(
    switchMap(id => this.resourceService.getDatasourceByServiceId(id).pipe(catchError(() => of(null))))
  ), {initialValue: null as Datasource | null});
}
