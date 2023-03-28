import {Component, OnInit} from '@angular/core';
import {ProviderBundle} from '../../../../entities/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-provider-update-history',
  templateUrl: 'provider-update-history.componenet.html'
})

export class ProviderUpdateHistoryComponent implements OnInit {

  providerId: string = null;
  providerBundle: ProviderBundle = null

  constructor(private route: ActivatedRoute, private providerService: ServiceProviderService) {
  }

  ngOnInit() {
    this.route.parent.params.subscribe(
      params => {
        this.providerId = params['providerId'];
        if (this.providerId) {
          this.providerService.getProviderBundle(this.providerId).subscribe(
            res => {this.providerBundle = res},
            error => {console.error(error)}
          )
        }
      }
    );
  }

}
