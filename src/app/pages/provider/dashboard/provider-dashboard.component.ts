import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {Provider, ProviderBundle} from '../../../entities/eic-model';

@Component({
  selector: 'app-provider-dashboard',
  templateUrl: 'provider-dashoard.component.html'
})

export class ProviderDashboardComponent implements OnInit {

  providerId: string = null;
  providerBundle: ProviderBundle = null;

  constructor(private route: ActivatedRoute, private serviceProviderService: ServiceProviderService) {
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
    console.log('set provider');
    console.log(this.providerBundle);
    componentReference.providerBundle = this.providerBundle;
  }

}
