import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {deleteCookie, getCookie} from '../entities/utils';
import {environment} from '../../environments/environment';


@Injectable()
export class AuthenticationService {

  base = environment.API_ENDPOINT;
  cookieName = 'AccessToken';

  constructor(private router: Router) { }

  tryLogin() {
    if (getCookie(this.cookieName) === null) {
      console.log('Didn\'t find cookie, user is not logged in.' )
      sessionStorage.setItem('redirectUrl', window.location.pathname);
      this.login();
    } else {
      console.log('found cookie, user is logged in');
    }
  }

  login() {
    window.location.href = this.base + environment.AAI_LOGIN;
  }

  logout() {
    sessionStorage.clear();
    deleteCookie(this.cookieName);
    window.location.href = `${environment.AAI_LOGOUT + window.location.origin + this.base}/logout`;
  }

  public isLoggedIn(): boolean {
    return getCookie(this.cookieName) !== null;
  }

  redirect() {
    if (sessionStorage.getItem('redirectUrl') !== null) {
      let url = sessionStorage.getItem('redirectUrl');
      sessionStorage.removeItem('redirectUrl');
      this.router.navigate([url]);
    }
  }

}
