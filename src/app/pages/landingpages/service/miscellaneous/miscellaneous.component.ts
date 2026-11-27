import {ChangeDetectionStrategy, Component, computed, inject, Signal} from '@angular/core';
import {ROUTER_OUTLET_DATA} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';
import {URL} from '../../../../entities/eic-model';
import {ServiceLandingData} from '../service-landing-data';

@Component({
  selector: 'app-service-landing-page-misc',
  imports: [NgOptimizedImage],
  templateUrl: 'miscellaneous.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiscellaneousComponent {
  private data = inject(ROUTER_OUTLET_DATA) as Signal<ServiceLandingData | null>;
  readonly payload = computed(() => this.data()?.service ?? null);

  navigateTo(url: URL) {
    window.open(url.toString(), '_blank');
  }
}
