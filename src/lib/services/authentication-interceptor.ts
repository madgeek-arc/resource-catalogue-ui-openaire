import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Injectable, Injector} from '@angular/core';


@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(public router: Router, private injector: Injector) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const authenticationService = this.injector.get(AuthenticationService);

    return next.handle(request).pipe(
      catchError((response: HttpErrorResponse) => {
        let errorMessage: string;
        if (response.error.message) {
          errorMessage = response.error.message;
        } else {
          // if (response.error.length > 100) {
          //   errorMessage = 'Server error';
          // } else {
            errorMessage = response.error;
          // }
        }
        const message = errorMessage;
        if (response.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', response.error.message);
        } else {
          if (response.status === 401) {
            // authenticationService.redirectURL = this.router.url
            // authenticationService.login();
            console.log('came here don\'t know what to do...');
            return null;
          } else if (response.status === 403) {
            this.router.navigate(['/forbidden']);
          } else if (response.status === 404 && request.url.includes('/faq/api/page/route')) {
            // avoiding page 404 for non-working faq
          } else if (response.status === 404) {
            this.router.navigate(['/notFound']);
          } else if (response.status === 0) { // this is a bandage until faq is fixed
            return [];
          } else {
            console.error(
              `Backend returned code ${response.status}, ` +
              `body was: ${JSON.stringify(errorMessage)}`);
          }
        }
        // return an observable with a user-facing error message
        // Uncomment to enable modal errors
        // UIkit.notification.closeAll();
        // UIkit.notification({message: message, status: 'danger', pos: 'top-center', timeout: 5000});
        return throwError(response);
      })
    );

  }

}
