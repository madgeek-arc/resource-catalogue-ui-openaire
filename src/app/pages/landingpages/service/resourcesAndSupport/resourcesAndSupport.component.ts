import {ChangeDetectionStrategy, Component, computed, inject, Signal} from '@angular/core';
import {RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {SlicePipe, DatePipe, NgOptimizedImage} from '@angular/common';
import {URL} from '../../../../entities/eic-model';
import {changeLogBadgeColor} from '../changelog-badge';
import {ServiceLandingData} from '../service-landing-data';

@Component({
  selector: 'app-service-landing-page-resources-and-support',
  templateUrl: 'resourcesAndSupport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SlicePipe, DatePipe, NgOptimizedImage]
})
export class ResourcesAndSupportComponent {
  private data = inject(ROUTER_OUTLET_DATA) as Signal<ServiceLandingData | null>;
  readonly payload = computed(() => this.data()?.service ?? null);

  readonly badgeColor = changeLogBadgeColor;

  goto(url: string | URL) {
    window.open(url.toString(), '_blank');
  }
}
