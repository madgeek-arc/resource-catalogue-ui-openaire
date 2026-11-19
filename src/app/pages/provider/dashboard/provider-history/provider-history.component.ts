import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {TitleCasePipe, DatePipe} from '@angular/common';
import {ProviderBundle} from '../../../../entities/eic-model';

@Component({
  selector: 'app-provider-history',
  templateUrl: 'provider-history.componenet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TitleCasePipe, DatePipe]
})
export class ProviderHistoryComponent {
  /** ProviderDashboardComponent passes the bundle through its router outlet; null until it has loaded. */
  readonly bundle = inject(ROUTER_OUTLET_DATA) as Signal<ProviderBundle | null>;
}
