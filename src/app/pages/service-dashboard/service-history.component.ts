import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, Observable} from 'rxjs';
import {Bundle, Service, ServiceHistory} from '../../entities/eic-model';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {Paging} from '../../entities/paging';
import {zip} from 'rxjs/internal/observable/zip';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-history.component.html',
})
export class ServiceHistoryComponent implements OnInit {

  @Input() serviceBundle: Bundle<Service>;

  constructor(private route: ActivatedRoute, private router: NavigationService, private resourceService: ResourceService) {
  }

  ngOnInit() {
    console.log('Service bundle in service-history.component ->', this.serviceBundle);
  }
}
