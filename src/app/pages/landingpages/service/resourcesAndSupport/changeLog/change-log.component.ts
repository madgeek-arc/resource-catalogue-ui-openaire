import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {Router, RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {DatePipe} from '@angular/common';
import {Service} from '../../../../../entities/eic-model';
import {changeLogBadgeColor} from '../../changelog-badge';

@Component({
  selector: 'app-change-log',
  templateUrl: 'change-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe]
})
export class ChangeLogComponent {
  /** ServiceLandingPageComponent passes the service through its router outlet; null until it has loaded. */
  readonly payload = inject(ROUTER_OUTLET_DATA) as Signal<Service | null>;

  readonly cleanView = inject(Router).url.includes('/changeLogClean');

  readonly badgeColor = changeLogBadgeColor;
}
