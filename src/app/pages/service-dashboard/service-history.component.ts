import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Bundle, Service} from '../../entities/eic-model';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-history.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ServiceHistoryComponent implements OnInit {

  @Input() serviceBundle: Bundle<Service>;

  constructor() {
  }

  ngOnInit() {
  }
}
