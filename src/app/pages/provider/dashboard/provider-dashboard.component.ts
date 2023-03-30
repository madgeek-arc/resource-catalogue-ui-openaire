import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {ProviderBundle} from '../../../entities/eic-model';


@Component({
  selector: 'app-provider-dashboard',
  templateUrl: 'provider-dashoard.component.html',
})

export class ProviderDashboardComponent implements OnInit {

  providerId: string = null;
  providerBundle: ProviderBundle = null;
  path: string = null;

  constructor(private route: ActivatedRoute, private router: Router, private serviceProviderService: ServiceProviderService) {
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          if (event.url.includes('info')) {
            this.path = 'info';
          } else if (event.url.includes('updateHistory')) {
            this.path = 'updateHistory';
          } else if (event.url.includes('services')) {
            this.path = 'services';
          }
        }
      }
    );
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.providerId = params['providerId'];
        if (this.providerId) {
          this.serviceProviderService.getProviderBundle(this.providerId).subscribe(
            res => {this.providerBundle = res},
            error => {console.error(error)}
          );
        }
      }
    );
  }

  onActivate(componentReference) {
    componentReference.providerBundle = this.providerBundle;
  }

}
