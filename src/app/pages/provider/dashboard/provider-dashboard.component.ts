import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-provider-dashboard',
  templateUrl: 'provider-dashoard.component.html'
})

export class ProviderDashboardComponent implements OnInit {

  providerId: string = null;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {this.providerId = params['providerId']}
    )
  }
}
