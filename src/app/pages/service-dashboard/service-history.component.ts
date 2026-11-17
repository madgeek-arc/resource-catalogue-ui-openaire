import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Bundle, Service} from '../../entities/eic-model';
import { RouterLink } from '@angular/router';
import { TitleCasePipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-service-dashboard',
    templateUrl: './service-history.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, TitleCasePipe, DatePipe]
})
export class ServiceHistoryComponent implements OnInit {

  @Input() serviceBundle: Bundle<Service>;

  constructor() {
  }

  ngOnInit() {
  }
}
