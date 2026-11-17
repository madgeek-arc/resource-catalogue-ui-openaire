import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Service, URL} from '../../../../entities/eic-model';

@Component({
  selector: 'app-service-landing-page-misc',
  templateUrl: 'miscellaneous.component.html',
  // styleUrls: ['../../landing-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class MiscellaneousComponent {

  @Input() resourcePayload: Service;

  navigateTo(url: URL) {
    window.open(url.toString(), '_blank');
  }

}
