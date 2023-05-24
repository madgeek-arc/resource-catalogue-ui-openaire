import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';


@Component({
  selector: 'app-admin-all-services-dashboard',
  templateUrl: 'all-services.component.html'
})

export class AllServicesDashboardComponent implements OnInit {

  path: string = null;

  titleIcon: string = null;
  title: string = null;

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    // this.route.params.subscribe(
    //   params => {
    //     this.providerId = params['providerId'];
    //     if (this.providerId) {
    //       this.serviceProviderService.getProviderBundle(this.providerId).subscribe(
    //         res => {this.providerBundle = res},
    //         error => {console.error(error)}
    //       );
    //     }
    //   }
    // );
  }

  // onActivate(componentReference) {
  //   componentReference.providerBundle = this.providerBundle;
  // }
}
