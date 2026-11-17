import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ProviderBundle} from '../../../../entities/eic-model';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-provider-full-history',
    templateUrl: 'provider-full-history.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, DatePipe]
})

export class ProviderFullHistoryComponent implements OnInit {

  @Input() providerBundle: ProviderBundle = null;

  constructor() {
  }

  ngOnInit() {
    // console.log(this.providerBundle);
  }

}
