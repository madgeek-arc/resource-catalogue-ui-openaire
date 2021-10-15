import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {NavigationService} from './navigation.service';
import {getCookie} from '../domain/utils';

@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {
    constructor(public authenticationService: AuthenticationService, public router: NavigationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const ret = this.authenticationService.getIsLoggedIn();
        console.log(ret);
        if (getCookie(this.authenticationService.cookieName) !== null) {
          this.authenticationService.redirectURL = state.url;
          this.authenticationService.tryLogin();
        } else if (!ret) {
            this.authenticationService.redirectURL = state.url;
            this.authenticationService.login();
        }
        return ret;
    }
}
