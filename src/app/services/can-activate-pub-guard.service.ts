import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NavigationService} from './navigation.service';
import {UserSessionService} from './user-session.service';

/** Lets only signed-out users through; a signed-in user is sent home. */
@Injectable()
export class CanActivateViaPubGuard implements CanActivate {
  constructor(private session: UserSessionService, public router: NavigationService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.session.ready$.pipe(
      map(user => !user || (this.router.home() && false))
    );
  }
}
