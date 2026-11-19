import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import {ResourceService} from '../../services/resource.service';
import {NavigationService} from '../../services/navigation.service';
import {Bundle, Datasource, Service} from '../../entities/eic-model';
import {Subscription} from 'rxjs';
import { NgClass } from '@angular/common';


@Component({
    selector: 'app-service-dashboard',
    templateUrl: './service-dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, NgClass, RouterOutlet]
})
export class ServiceDashboardComponent implements OnInit {
  resourceService = inject(ResourceService);
  router = inject(NavigationService);
  private route = inject(ActivatedRoute);


  public serviceBundle: Bundle<Service | Datasource>;
  public service: Service;
  providerId: string;
  serviceId: string;
  datasource: Datasource = null;

  private sub: Subscription;

  ngOnInit() {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.serviceId = this.route.snapshot.paramMap.get('resourceId');

    this.sub = this.route.params.subscribe(params => {
      this.resourceService.getServiceOrDatasourceBundle(params['resourceId']).subscribe(
        suc => {
          this.serviceBundle = suc;
        },
        err => {
          if (err.status === 404) {
            this.router.go('/404');
          }
          // this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      );

      this.resourceService.getDatasourceByServiceId(params['resourceId']).subscribe(
        datasource => this.datasource = datasource
      );
    });
  }

  onActivate(componentReference) {
    // For the pages that are still Eager. The OnPush history pages read [routerOutletData] instead, which also
    // reaches them when the bundle loads after they are shown.
    componentReference.serviceBundle = this.serviceBundle;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
