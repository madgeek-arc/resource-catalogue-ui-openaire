import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {ROUTER_OUTLET_DATA} from '@angular/router';
import {Service, URL} from '../../../../entities/eic-model';

@Component({
  selector: 'app-service-landing-page-misc',
  templateUrl: 'miscellaneous.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiscellaneousComponent {
  /** ServiceLandingPageComponent passes the service through its router outlet; null until it has loaded. */
  readonly payload = inject(ROUTER_OUTLET_DATA) as Signal<Service | null>;

  navigateTo(url: URL) {
    window.open(url.toString(), '_blank');
  }
}
