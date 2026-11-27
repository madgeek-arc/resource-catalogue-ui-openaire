import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink, RouterOutlet} from '@angular/router';
import {EMPTY, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {ResourceService} from '../../services/resource.service';
import {NavigationService} from '../../services/navigation.service';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-dashboard.component.html',
  styleUrl: './service-dashboard.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet]
})
export class ServiceDashboardComponent {
  private resourceService = inject(ResourceService);
  private navigation = inject(NavigationService);
  private route = inject(ActivatedRoute);

  /** Follow the route, so another service's dashboard opened from here does not keep the old ids. */
  readonly providerId = toSignal(this.route.params.pipe(map(params => params['providerId'] as string)));
  readonly serviceId = toSignal(this.route.params.pipe(map(params => params['resourceId'] as string)));

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
  ), {initialValue: undefined});

  /** The service's datasource subprofile, if it has one. */
  readonly subprofile = toSignal(this.resourceId$.pipe(
    switchMap(id => this.resourceService.getDatasourceByServiceId(id).pipe(catchError(() => of(null))))
  ), {initialValue: null});
}
