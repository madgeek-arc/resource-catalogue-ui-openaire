import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-not-found-page',
    templateUrl: './not-found-page.component.html',
    styleUrls: ['./not-found-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class NotFoundPageComponent implements OnInit {

  projectName = environment.projectName;
  serviceORresource = environment.serviceORresource;

  constructor() { }

  ngOnInit() {
  }

}
