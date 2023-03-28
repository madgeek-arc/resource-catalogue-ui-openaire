import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Provider, ProviderBundle} from '../../../../entities/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';

@Component({
  selector: 'app-provider-info',
  templateUrl: 'provider-info.component.html'
})

export class ProviderInfoComponent implements OnInit, OnChanges {

  @Input() providerBundle: ProviderBundle = null;
  provider: Provider = null

  constructor() {
  }

  ngOnInit() {
    if (this.providerBundle) {
      this.provider = this.providerBundle.provider;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.providerBundle) {
      this.provider = this.providerBundle.provider;
    }
  }
}
