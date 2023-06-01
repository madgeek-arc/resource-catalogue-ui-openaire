import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {ProviderBundle} from '../../../entities/eic-model';


@Component({
  selector: 'app-provider-dashboard',
  templateUrl: 'provider-dashboard.component.html',
})

export class ProviderDashboardComponent implements OnInit {

  providerId: string = null;
  providerBundle: ProviderBundle = null;
  path: string = null;

  titleIcon: string = null;
  title: string = null;

  constructor(private route: ActivatedRoute, private router: Router, private serviceProviderService: ServiceProviderService) {
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          if (event.url.includes('home')) {
            this.path = 'home';
            this.titleIcon = 'home';
            this.title = 'Home';
          } else if (event.url.includes('info')) {
            this.path = 'info';
            this.titleIcon = 'info';
            this.title = 'Provider\'s profile';
          } else if (event.url.includes('updateHistory')) {
            this.path = 'updateHistory';
            this.titleIcon = 'history';
            this.title = 'History of updates';
          } else if (event.url.includes('services')) {
            this.path = 'services';
            this.titleIcon = 'reorder';
            this.title = 'Services';
          }
        }
      }
    );
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.providerId = params['providerId'];
        if (this.providerId) {
          this.serviceProviderService.getProviderBundleById(this.providerId).subscribe(
            res => {this.providerBundle = res},
            error => {console.error(error)}
          );
        }
      }
    );
  }

  onActivate(componentReference) {
    componentReference.providerBundle = this.providerBundle;
  }

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
