import {Component, Input, OnInit} from '@angular/core';
import {Bundle, Service} from '../../entities/eic-model';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-history.component.html',
})
export class ServiceHistoryComponent implements OnInit {

  @Input() serviceBundle: Bundle<Service>;

  constructor() {
  }

  ngOnInit() {
  }
}
