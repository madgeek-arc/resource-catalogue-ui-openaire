import {Component, Input, OnInit} from '@angular/core';
import {ProviderBundle} from '../../../../entities/eic-model';

@Component({
  selector: 'app-provider-update-history',
  templateUrl: 'provider-update-history.componenet.html'
})

export class ProviderUpdateHistoryComponent implements OnInit {

  @Input() providerBundle: ProviderBundle = null

  constructor() {
  }

  ngOnInit() {
    // console.log(this.providerBundle);
  }

}
