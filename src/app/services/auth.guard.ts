import {inject} from '@angular/core';
import {CanActivateFn} from '@angular/router';
import {map} from 'rxjs/operators';
import {UserSessionService} from './user-session.service';

/**
 * Lets signed-in users through; anyone else is sent to the login page and returns to the route they asked for.
 * It waits for the user-info call to answer, so a signed-in user is not sent to log in again on a fresh page load.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(UserSessionService);
  return session.ready$.pipe(
    map(user => {
      if (user) {
        return true;
      }
      session.login(state.url);
      return false;
    })
  );
};
