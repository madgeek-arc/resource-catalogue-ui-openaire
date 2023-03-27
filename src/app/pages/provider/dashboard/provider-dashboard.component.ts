import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {Provider} from '../../../entities/eic-model';

@Component({
  selector: 'app-provider-dashboard',
  templateUrl: 'provider-dashoard.component.html'
})

export class ProviderDashboardComponent implements OnInit {

  providerId: string = null;
  provider: Provider = null;

  constructor(private route: ActivatedRoute, private serviceProviderService: ServiceProviderService) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.providerId = params['providerId'];
        if (this.providerId) {
          this.serviceProviderService.getServiceProviderById(this.providerId).subscribe(
            res => {this.provider = res}
          );
        }
      }
    );
  }
}