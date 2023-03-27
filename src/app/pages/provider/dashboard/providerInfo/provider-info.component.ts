import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Provider} from '../../../../entities/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';

@Component({
  selector: 'app-provider-info',
  templateUrl: 'provider-info.component.html'
})

export class ProviderInfoComponent implements OnInit {

  providerId: string = null;
  provider: Provider = null;

  constructor(private route: ActivatedRoute, private serviceProviderService: ServiceProviderService) {
  }

  ngOnInit() {
    this.route.parent.params.subscribe(
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
