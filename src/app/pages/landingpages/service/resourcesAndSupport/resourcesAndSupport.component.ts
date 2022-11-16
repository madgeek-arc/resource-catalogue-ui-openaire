import {Component, Input} from '@angular/core';
import {Service, URL} from '../../../../entities/eic-model';

@Component({
  selector: 'app-service-landing-page-resources-and-support',
  templateUrl: 'resourcesAndSupport.component.html',
  // styleUrls: ['../../landing-page.component.css']
})
export class ResourcesAndSupportComponent {

  @Input() resourcePayload: Service = null;

  goto(url: string | URL) {
    window.open(url.toString(), '_blank');
  }

}
