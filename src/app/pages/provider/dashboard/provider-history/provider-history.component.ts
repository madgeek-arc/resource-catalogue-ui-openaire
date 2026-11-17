import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ProviderBundle} from '../../../../entities/eic-model';
import { RouterLink } from '@angular/router';
import { TitleCasePipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-provider-history',
    templateUrl: 'provider-history.componenet.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, TitleCasePipe, DatePipe]
})

export class ProviderHistoryComponent implements OnInit {

  @Input() providerBundle: ProviderBundle = null;

  constructor() {
  }

  ngOnInit() {
    // console.log(this.providerBundle);
  }

}
