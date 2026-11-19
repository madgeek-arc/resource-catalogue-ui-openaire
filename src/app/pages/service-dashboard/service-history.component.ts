import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {TitleCasePipe, DatePipe} from '@angular/common';
import {Bundle, Service} from '../../entities/eic-model';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TitleCasePipe, DatePipe]
})
export class ServiceHistoryComponent {
  /** ServiceDashboardComponent passes the bundle through its router outlet; undefined until it has loaded. */
  readonly bundle = inject(ROUTER_OUTLET_DATA) as Signal<Bundle<Service> | undefined>;
}
