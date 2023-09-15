import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: 'admin-dashboard.component.html',
})

export class AdminDashboardComponent implements OnInit {

  path: string = null;

  titleIcon: string = null;
  title: string = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          if (event.url.includes('services')) {
            this.path = 'services';
            this.titleIcon = 'grid_view';
            this.title = 'Services';
          } else {
            this.path = 'providers';
            this.titleIcon = 'real_estate_agent';
            this.title = 'Providers';
          }
        }
      }
    );
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

  toggleSidebar() {
    const el: HTMLElement = document.getElementById('sidebar_toggle');
    if(!el.classList.contains('closed')) {
      el.classList.add('closed');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.remove('sidebar_main_active');
      el1.classList.add('sidebar_main_inactive');
    } else {
      el.classList.remove('closed');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.add('sidebar_main_active');
      el1.classList.remove('sidebar_main_inactive');
    }
  }

}
