import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {NavigationService} from '../../services/navigation.service';
import {environment} from '../../../environments/environment';
import {Bundle, Service} from '../../entities/eic-model';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-dashboard.component.html',
})
export class ServiceDashboardComponent implements OnInit {

  public serviceBundle: Bundle<Service>;
  public service: Service;
  providerId: string;
  serviceId: string;

  private sub: Subscription;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public router: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.serviceId = this.route.snapshot.paramMap.get('resourceId');

    this.sub = this.route.params.subscribe(params => {
      this.resourceService.getServiceOrDatasource(params['resourceId']).subscribe(suc => {
          this.service = <Service>suc;
        },
        err => {
          if (err.status === 404) {
            this.router.go('/404');
          }
          // this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      );
      this.resourceService.getServiceBundle(params['resourceId']).subscribe(suc => {
        this.serviceBundle = suc;
          console.log('Service bundle in service-dashboard.component ->', this.serviceBundle);
      },
        err => {
          if (err.status === 404) {
            this.router.go('/404');
          }
          // this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      )
    });
  }

  onActivate(componentReference) {
    componentReference.serviceBundle = this.serviceBundle;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
