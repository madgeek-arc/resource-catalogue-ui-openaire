import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {ROUTER_OUTLET_DATA} from '@angular/router';
import {Service} from '../../../../entities/eic-model';

@Component({
  selector: 'app-service-landing-page-pricing',
  templateUrl: 'pricing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricingComponent {
  /** ServiceLandingPageComponent passes the service through its router outlet; null until it has loaded. */
  readonly payload = inject(ROUTER_OUTLET_DATA) as Signal<Service | null>;

  goto(url: string) {
    window.open(url, '_blank');
  }
}
