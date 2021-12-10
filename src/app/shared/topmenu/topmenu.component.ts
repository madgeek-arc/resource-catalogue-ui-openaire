import {Component, OnInit} from '@angular/core';
import {TopMenuComponent} from '../../../lib/shared/topmenu/topmenu.component';
import {AuthenticationService} from '../../../lib/services/authentication.service';
import {Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {NavigationService} from '../../../lib/services/navigation.service';
import {ResourceService} from '../../../lib/services/resource.service';
import {DataSharingService} from '../../../lib/services/data-sharing.service';
import {UiVocabulary} from '../../../lib/domain/dynamic-form-model';

@Component({
  selector: 'app-top-menu-aire',
  templateUrl: './topmenu.component.html',
  styleUrls: ['./topmenu.component.css'],
})

export class AireTopMenuComponent extends TopMenuComponent implements OnInit{

  services: Map<string, UiVocabulary[]>;
  refresh = false;

  public portfolioItemActive: string = null;

  constructor(public authenticationService: AuthenticationService, public router: Router, public fb: FormBuilder,
              public navigationService: NavigationService, public resourceService: ResourceService,
              private dataSharingService: DataSharingService) {
    super(authenticationService, router, fb, navigationService, resourceService);
  }

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
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
      this.router.navigate([url]));
  }

  portfolioActive(portfolioItem: string) {
    this.portfolioItemActive = portfolioItem;
  }
}
