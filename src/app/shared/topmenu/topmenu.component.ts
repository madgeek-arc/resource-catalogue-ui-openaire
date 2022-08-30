import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {DataSharingService} from '../../services/data-sharing.service';
import {PortfolioMap} from '../../entities/portfolioMap';
import * as UIkit from 'uikit';


@Component({
  selector: 'app-top-menu-aire',
  templateUrl: './topmenu.component.html',
  styleUrls: ['./topmenu.component.css'],
})

export class AireTopMenuComponent implements OnInit {

  services: PortfolioMap = null;
  refresh = false;

  public portfolioItemActive: string = null;

  constructor(public authenticationService: AuthenticationService, public router: Router, public fb: FormBuilder,
              public navigationService: NavigationService, public resourceService: ResourceService,
              private dataSharingService: DataSharingService) {}

  ngOnInit() {

    this.dataSharingService.refreshRequired.subscribe( value => {
      this.refresh = value;
      if (this.refresh) {
        this.resourceService.getServicesByIndexedField('portfolios', 'Portfolios').subscribe(
          res => {this.services = res; },
          error => {console.log(error); },
          () => {this.dataSharingService.refreshRequired.next(false); }
        );
      }
    });

  }

  redirectTo(url: string) {
    UIkit.drop('#ukDrop').hide(false);
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
      this.router.navigate([url]));
  }

  portfolioActive(portfolioItem: string) {
    this.portfolioItemActive = portfolioItem;
  }
}
