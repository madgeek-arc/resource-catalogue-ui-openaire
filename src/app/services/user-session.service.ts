import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, take} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {UserInfo} from '../entities/userInfo';
import {UserService} from './user.service';

/** A path inside this app: one leading slash, so it can never point at another site (`//host`, `/\host`). */
export const isAppUrl = (url: string | null): boolean =>
  !!url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');

interface SessionState {
  loading: boolean;
  user: UserInfo | null;
}

/**
 * Who is signed in. The answer to `GET /api/user/info` is the only source of truth: a body means signed in, any
 * error (401, a server or network problem) means signed out. There is no cookie to look at.
 * The call is made once, when the service is first used.
 */
@Injectable({providedIn: 'root'})
export class UserSessionService {

  private readonly state = new BehaviorSubject<SessionState>({loading: true, user: null});

  /** The signed-in user, or null while loading and when signed out. */
  readonly user$: Observable<UserInfo | null> = this.state.pipe(map(s => s.user), distinctUntilChanged());
  /** True until the user-info call has answered, either way. */
  readonly loading$: Observable<boolean> = this.state.pipe(map(s => s.loading), distinctUntilChanged());
  /** Emits once, after the user-info call has answered: the signed-in user, or null. */
  readonly ready$: Observable<UserInfo | null> = this.state.pipe(filter(s => !s.loading), take(1), map(s => s.user));

  constructor(private router: Router, private userService: UserService) {
    this.userService.getUserInfo().subscribe(
      user => this.state.next({loading: false, user: user ?? null}),
      () => this.state.next({loading: false, user: null})
    );
  }

  get user(): UserInfo | null {
    return this.state.value.user;
  }

  /** False while the user-info call is still pending; use `ready$` when the answer matters. */
  isSignedIn(): boolean {
    return this.state.value.user !== null;
  }

  get displayName(): string {
    const user = this.user;
    if (!user) {
      return '';
    }
    return user.fullname?.trim() || `${user.name ?? ''} ${user.surname ?? ''}`.trim() || user.email || '';
  }

  /**
   * Leaves for the login page of the API and asks it to bring the user back to the page they were on: the full
   * address of that page goes in the `redirectUrl` parameter. The page is always one of this app's own.
   */
  login(returnUrl: string = this.router.url): void {
    const page = window.location.origin + (isAppUrl(returnUrl) ? returnUrl : '/');
    window.location.href = `${environment.API_ENDPOINT}${environment.AAI_LOGIN}?redirectUrl=${encodeURIComponent(page)}`;
  }

  logout(): void {
    sessionStorage.clear();
    window.location.href = environment.API_ENDPOINT + environment.AAI_LOGOUT;
  }
}
