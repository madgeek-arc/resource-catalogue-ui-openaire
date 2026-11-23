import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ProviderBundle} from '../../../../entities/eic-model';

@Component({
  selector: 'app-provider-full-history',
  templateUrl: 'provider-full-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe]
})
export class ProviderFullHistoryComponent {
  /** ProviderDashboardComponent passes the provider through its router outlet, which it only shows once the provider has loaded. */
  readonly bundle = inject(ROUTER_OUTLET_DATA) as Signal<ProviderBundle>;
}
