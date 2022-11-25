import {Component, Input, OnInit} from '@angular/core';
import {Service} from '../../../../entities/eic-model';

@Component({
  selector: 'app-service-landing-page-pricing',
  templateUrl: 'pricing.component.html',
  // styleUrls: ['../../landing-page.component.css']
})
export class PricingComponent {

  @Input() resourcePayload: Service = null;

  goto(url: string) {
    window.open(url, '_blank');
  }

}
