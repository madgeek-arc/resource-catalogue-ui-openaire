import {ChangeDetectionStrategy, Component, computed, inject, Signal} from '@angular/core';
import {ROUTER_OUTLET_DATA} from '@angular/router';
import {ServiceLandingData} from '../service-landing-data';

@Component({
  selector: 'app-service-landing-page-pricing',
  templateUrl: 'pricing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricingComponent {
  private data = inject(ROUTER_OUTLET_DATA) as Signal<ServiceLandingData | null>;
  readonly payload = computed(() => this.data()?.service ?? null);

  goto(url: string) {
    window.open(url, '_blank');
  }
}
