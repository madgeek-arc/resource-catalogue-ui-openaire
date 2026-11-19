import {ChangeDetectionStrategy, Component, computed, inject, Signal} from '@angular/core';
import {Router, RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {DatePipe} from '@angular/common';
import {changeLogBadgeColor} from '../../changelog-badge';
import {ServiceLandingData} from '../../service-landing-data';

@Component({
  selector: 'app-change-log',
  templateUrl: 'change-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe]
})
export class ChangeLogComponent {
  private data = inject(ROUTER_OUTLET_DATA) as Signal<ServiceLandingData | null>;
  readonly payload = computed(() => this.data()?.service ?? null);

  readonly cleanView = inject(Router).url.includes('/changeLogClean');

  readonly badgeColor = changeLogBadgeColor;
}
