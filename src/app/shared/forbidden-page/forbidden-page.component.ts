import { Component, ChangeDetectionStrategy } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-forbidden-page',
    templateUrl: './forbidden-page.component.html',
    styleUrls: ['./forbidden-page.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForbiddenPageComponent {

  projectName = environment.projectName;
  serviceORresource = environment.serviceORresource;
}
