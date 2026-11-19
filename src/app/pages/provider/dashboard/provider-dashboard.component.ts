import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {EMPTY} from 'rxjs';
import {catchError, filter, map, switchMap} from 'rxjs/operators';
import {ProviderService} from '../../../services/provider.service';
import {ProviderBundle} from '../../../entities/eic-model';

/** The section of the dashboard a URL is in, with its title and icon. */
const sections = [
  {path: 'home', icon: 'home', title: 'Home'},
  {path: 'info', icon: 'info', title: 'Provider\'s profile'},
  {path: 'history', icon: 'history', title: 'History of updates'},
  {path: 'services', icon: 'reorder', title: 'Services'},
];

@Component({
  selector: 'app-provider-dashboard',
  templateUrl: 'provider-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet]
})
export class ProviderDashboardComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private providerService = inject(ProviderService);

  readonly providerId = toSignal(this.route.params.pipe(map(params => params['providerId'] as string)));

  /** The provider, also passed to every section through the router outlet; null until it has loaded. */
  readonly bundle = toSignal(this.route.params.pipe(
    map(params => params['providerId'] as string),
    filter(providerId => !!providerId),
    switchMap(providerId => this.providerService.getProviderBundleById(providerId).pipe(
      catchError(error => {
        console.error(error);
        return EMPTY;
      })
    ))
  ), {initialValue: null as ProviderBundle | null});

  /** Set on each navigation; a URL in none of the sections keeps the previous one, as before. */
  readonly section = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => sections.find(section => event.url.includes(section.path))),
    filter(section => section !== undefined)
  ), {initialValue: null});

  toggleSidebar() {
    const el: HTMLElement = document.getElementById('sidebar_toggle');
    const content: HTMLElement = document.getElementById('sidebar_main_content');
    if (!el.classList.contains('closed')) {
      el.classList.add('closed');
      content.classList.remove('sidebar_main_active');
      content.classList.add('sidebar_main_inactive');
    } else {
      el.classList.remove('closed');
      content.classList.add('sidebar_main_active');
      content.classList.remove('sidebar_main_inactive');
    }
  }
}
