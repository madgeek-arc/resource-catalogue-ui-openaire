import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {UserSessionService} from '../../services/user-session.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import {ResourceService} from '../../services/resource.service';
import {DataSharingService} from '../../services/data-sharing.service';
import {Provider, Service} from '../../entities/eic-model';
import {UserService} from '../../services/user.service';
import {EMPTY, of} from 'rxjs';
import {catchError, filter, map, switchMap} from 'rxjs/operators';
import { KeyValuePipe } from '@angular/common';


@Component({
    selector: 'app-top-menu-aire',
    templateUrl: './topmenu.component.html',
    styleUrls: ['./topmenu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, KeyValuePipe]
})

export class AireTopMenuComponent {
  session = inject(UserSessionService);
  router = inject(Router);
  private resourceService = inject(ResourceService);
  private dataSharingService = inject(DataSharingService);
  private userService = inject(UserService);

  // Login state comes only from the user-info call (see UserSessionService); there is no cookie to read.
  readonly user = toSignal(this.session.user$, {initialValue: null});
  readonly loading = toSignal(this.session.loading$, {initialValue: true});
  readonly isLoggedIn = computed(() => this.user() !== null);

  /** The signed-in user's providers; switchMap drops a pending answer that belongs to a previous user. */
  readonly myProviders = toSignal(this.session.user$.pipe(
    switchMap(user => user === null ? of([] as Provider[]) : this.userService.getMyProviders().pipe(
      catchError(error => {
        console.error(error);
        return of([] as Provider[]);
      })
    ))
  ), {initialValue: [] as Provider[]});

  /**
   * True on routes whose deepest snapshot has `data: {dashboardMode: true}`.
   * Reads the router's current state rather than an injected ActivatedRoute: ProviderHomeComponent turns off
   * route reuse, after which each navigation builds a new root and an injected one keeps the old snapshot.
   */
  readonly dashboardMode = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => {
      let route = this.router.routerState.snapshot.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      return !!route.data['dashboardMode'];
    })
  ), {initialValue: false});

  readonly resources = signal<Record<string, Service[]> | null>(null);

  readonly portfolioItemActive = signal<string | null>(null);

  constructor() {
    this.dataSharingService.refreshRequired.pipe(
      filter(refresh => refresh),
      // A failed load is caught here so that the next refresh still loads; refreshRequired stays true, as before.
      switchMap(() => this.resourceService.getResourcesGroupedByField('portfolios', true).pipe(
        catchError(error => {
          console.error(error);
          return EMPTY;
        })
      )),
      takeUntilDestroyed()
    ).subscribe(res => {
      this.resources.set(res);
      this.dataSharingService.refreshRequired.next(false);
    });
  }

  redirectTo(url: string) {
    UIkit.drop('#ukDrop').hide(false);
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
      this.router.navigate([url]));
  }

  hideDrop(elementId: string) {
    UIkit.drop(elementId).hide(false);
  }

  portfolioActive(portfolioItem: string) {
    this.portfolioItemActive.set(portfolioItem);
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
}
