import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {SlicePipe, DatePipe} from '@angular/common';
import {Service, URL} from '../../../../entities/eic-model';
import {changeLogBadgeColor} from '../changelog-badge';

@Component({
  selector: 'app-service-landing-page-resources-and-support',
  templateUrl: 'resourcesAndSupport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SlicePipe, DatePipe]
})
export class ResourcesAndSupportComponent {
  /** ServiceLandingPageComponent passes the service through its router outlet; null until it has loaded. */
  readonly payload = inject(ROUTER_OUTLET_DATA) as Signal<Service | null>;

  readonly badgeColor = changeLogBadgeColor;

  goto(url: string | URL) {
    window.open(url.toString(), '_blank');
  }
}
