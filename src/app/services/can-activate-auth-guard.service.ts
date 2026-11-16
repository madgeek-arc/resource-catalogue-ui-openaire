import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {UserSessionService} from './user-session.service';

/**
 * Lets signed-in users through; anyone else is sent to the login page and returns to the route they asked for.
 * It waits for the user-info call to answer, so a signed-in user is not sent to log in again on a fresh page load.
 */
@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {
  constructor(private session: UserSessionService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.session.ready$.pipe(
      map(user => {
        if (user) {
          return true;
        }
        this.session.login(state.url);
        return false;
      })
    );
  }
}
