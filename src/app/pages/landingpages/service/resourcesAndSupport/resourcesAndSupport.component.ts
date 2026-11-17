import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Service, URL } from '../../../../entities/eic-model';
import { NgStyle, SlicePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-service-landing-page-resources-and-support',
    templateUrl: 'resourcesAndSupport.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgStyle, RouterLink, SlicePipe, DatePipe]
})

export class ResourcesAndSupportComponent {

  @Input() resourcePayload: Service = null;

  goto(url: string | URL) {
    window.open(url.toString(), '_blank');
  }

  badgeColor(status: string) {
    switch (status) {
      case 'Add':
        return 'rgb(76, 137, 242)';
      case 'Added':
        return 'rgb(20, 179, 119)';
      case 'Fixed':
        return 'rgb(240, 80, 110)';
      case 'Changed':
        return 'rgb(76, 137, 242)';
      case 'Removed':
        return 'rgb(250, 160, 90)';
    }
  }

}
