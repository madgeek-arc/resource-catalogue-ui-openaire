import {Component, OnInit} from '@angular/core';
import {UserSessionService} from '../../services/user-session.service';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {ResourceService} from '../../services/resource.service';
import {DataSharingService} from '../../services/data-sharing.service';
import {Datasource, Provider, Service} from '../../entities/eic-model';
import {UserInfo} from '../../entities/userInfo';
import {UserService} from '../../services/user.service';
import * as UIkit from 'uikit';
import {filter, map} from 'rxjs/operators';


@Component({
  selector: 'app-top-menu-aire',
  templateUrl: './topmenu.component.html',
  styleUrls: ['./topmenu.component.css'],
})

export class AireTopMenuComponent implements OnInit {

  resources: Map<string, Service[] | Datasource[]> = null;
  refresh = false;
  user: UserInfo = null;
  myProviders: Provider[] = [];
  isLoggedIn = false;
  loading = true;

  dashboardMode = false;

  public portfolioItemActive: string = null;

  constructor(public session: UserSessionService, public router: Router, public resourceService: ResourceService,
              private dataSharingService: DataSharingService, private userService: UserService, private route: ActivatedRoute) {}

  ngOnInit() {

    this.isInDashboardMode();

    this.dataSharingService.refreshRequired.subscribe( value => {
      this.refresh = value;
      if (this.refresh) {
        // this.resourceService.getServicesByIndexedField('portfolios', 'Portfolios').subscribe(
        this.resourceService.getResourcesGroupedByField('portfolios', true).subscribe(
          res => {this.resources = res; },
          error => {console.log(error); },
          () => {this.dataSharingService.refreshRequired.next(false); }
        );
      }
    });

    // Login state comes only from the user-info call (see UserSessionService); there is no cookie to read.
    this.session.loading$.subscribe(loading => this.loading = loading);
    this.session.user$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = user !== null;
      this.myProviders = [];
      if (this.isLoggedIn) {
        this.userService.getMyProviders().subscribe(
          res => {this.myProviders = res;},
          error => {console.error(error);}
        );
      }
    });

  }

  redirectTo(url: string) {
    UIkit.drop('#ukDrop').hide(false);
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
      this.router.navigate([url]));
  }

  hideDrop(elementId) {
    UIkit.drop(elementId).hide(false);
  }

  portfolioActive(portfolioItem: string) {
    this.portfolioItemActive = portfolioItem;
  }

  login() {
    this.session.login();
  }

  logout() {
    this.session.logout();
  }

  getInitials(fullName: string) {
    return fullName.split(' ').map((n)=>n[0]).join('');
  }

  isInDashboardMode() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route.snapshot),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .subscribe((route: ActivatedRouteSnapshot) => {
        this.dashboardMode = route.data['dashboardMode'];
      });
  }
}
