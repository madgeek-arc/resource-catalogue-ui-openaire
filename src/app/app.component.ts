import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {Event, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, map} from 'rxjs/operators';
import {AireTopMenuComponent} from './shared/topmenu/topmenu.component';
import {AireFooterComponent} from './shared/footer/footer.component';
import {CookieLawComponent} from './shared/reusablecomponents/cookie-law/cookie-law.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AireTopMenuComponent, AireFooterComponent, CookieLawComponent],
})
export class AppComponent {
  private router = inject(Router);

  /** The URL of the latest router event that has one, from the start of each navigation on. */
  private readonly url = toSignal(this.router.events.pipe(
    map(event => (event as Event & {url?: string}).url),
    filter((url): url is string => !!url)
  ), {initialValue: ''});

  /** The change log shown without the menu, footer and cookie banner. */
  readonly cleanView = computed(() => this.url().includes('/changeLogClean'));
  /** Dashboards have a sidebar, so the footer moves right. */
  readonly dashboardView = computed(() => this.url().includes('/dashboard'));

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => window.scrollTo(0, 0));
  }
}
