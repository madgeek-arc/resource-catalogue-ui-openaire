import {inject, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {ResourceService} from '../services/resource.service';
import {UserSessionService} from '../services/user-session.service';

/**
 * True once the signed-in user turns out to be a member of the OpenAIRE provider, in the OpenAIRE Catalogue only.
 * Call it in an injection context, such as a field initialiser.
 */
export function canEditOpenAireServices(): Signal<boolean> {
  const resourceService = inject(ResourceService);
  return toSignal(inject(UserSessionService).ready$.pipe(
    switchMap(user => user && environment.projectName === 'OpenAIRE Catalogue'
      ? resourceService.getMyServiceProviders().pipe(
        map(providers => providers.some(provider => provider.id === 'openaire')),
        catchError(error => {
          console.error(error);
          return of(false);
        }))
      : of(false))
  ), {initialValue: false});
}
