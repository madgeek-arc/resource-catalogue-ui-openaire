import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {DatePipe} from '@angular/common';
import {Bundle, Service} from '../../entities/eic-model';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-full-history.component.html',
  styleUrl: './service-full-history.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe]
})
export class ServiceFullHistoryComponent {
  /** ServiceDashboardComponent passes the bundle through its router outlet; undefined until it has loaded. */
  readonly bundle = inject(ROUTER_OUTLET_DATA) as Signal<Bundle<Service> | undefined>;
}
