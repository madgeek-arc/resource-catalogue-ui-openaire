import {
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Router} from '@angular/router';
import {EMPTY, Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';

/** Set on a request whose 404 the caller handles itself (e.g. trying a service id before a datasource id). */
export const SKIP_NOT_FOUND_REDIRECT = new HttpContextToken<boolean>(() => false);
export const skipNotFoundRedirect = () => new HttpContext().set(SKIP_NOT_FOUND_REDIRECT, true);

/**
 * Handles failed API calls in one place. Every error still reaches the caller as the original HttpErrorResponse.
 *  - 401: nothing to do here. The user-info call gets a 401 on every anonymous visit; that only means "signed out".
 *  - 403: show the forbidden page, except for the user-info call, which must never move the visitor.
 *  - 404: show the not-found page, unless the request opted out with SKIP_NOT_FOUND_REDIRECT.
 */
@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(public router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.error instanceof ErrorEvent) {
          // A client-side or network error occurred.
          console.error('An error occurred:', response.error.message);
        } else if (response.status === 403) {
          if (!request.url.includes('user/info')) {
            this.router.navigate(['/forbidden']);
          }
        } else if (response.status === 404 && request.url.includes('/faq/api/page/route')) {
          // avoiding page 404 for non-working faq
        } else if (response.status === 404) {
          if (!request.context.get(SKIP_NOT_FOUND_REDIRECT)) {
            this.router.navigate(['/notFound']);
          }
        } else if (response.status === 0) { // this is a bandage until faq is fixed
          return EMPTY;
        } else if (response.status !== 401) {
          console.error(`Backend returned code ${response.status}, body was: ${JSON.stringify(response.error)}`);
        }
        return throwError(response);
      })
    );
  }

}
