import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {AireTopMenuComponent} from './shared/topmenu/topmenu.component';
import {AireFooterComponent} from './shared/footer/footer.component';
import {CookieLawComponent} from './shared/reusablecomponents/cookie-law/cookie-law.component';
import {SmoothScroll} from './services/smooth-scroll';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, AireTopMenuComponent, AireFooterComponent, CookieLawComponent],
})
export class AppComponent implements OnInit {
  router = inject(Router);

  isLoginOrRegister = false;

  breadcrumbs: string[] = [];

  cleanView = false;
  dashboardView = false;

  ngOnInit() {
    this.router.events.subscribe((evt: any) => {
      if (evt.url) {
        this.cleanView = evt.url.includes('/changeLogClean');
        this.dashboardView = evt.url.includes('/dashboard');
        this.breadcrumbs = evt.url.split(/\//);
      }
      this.breadcrumbs[0] = 'Home';
      // this.isLoginOrRegister = ["/signUp", "/signIn"].indexOf(evt.url) >= 0;
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

}
