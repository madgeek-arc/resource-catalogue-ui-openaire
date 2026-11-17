import {Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Bundle, Service} from '../../entities/eic-model';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-service-dashboard',
    templateUrl: './service-full-history.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, DatePipe]
})
export class ServiceFullHistoryComponent implements OnInit {

  @Input() serviceBundle: Bundle<Service>;

  constructor() {
  }

  ngOnInit() {
  }

}
