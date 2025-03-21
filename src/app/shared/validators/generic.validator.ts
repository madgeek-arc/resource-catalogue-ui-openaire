import {AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors} from '@angular/forms';
import {Observable, timer} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {ProviderService} from '../../services/provider.service';

export function URLValidator(control: AbstractControl) {
    return PatternValidator(control, /^(https?:\/\/.+){0,1}$/);
}

export function URLListValidator(control: AbstractControl) {
    if (control.value.split) {
        return validateArray(control.value.split('\n'), /https?:\/\/.+/);
    } else {
        return null;
    }
}

export class UrlValidator {
  static createValidator(service: ProviderService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      return service.validateUrl(control.value).pipe(
        map((result: boolean) => (result ? null : {invalidAsync: true}))
      );
    };
  }
}

/** Increase time var to reduce server calls **/
export const urlAsyncValidator = (service: ProviderService, time: number = 0) => {
  return (control: AbstractControl): Observable<ValidationErrors> => {
    if (control.value === '') {
      return timer(time).pipe(map(res => {
        return null;
        })
      );
    }
    return timer(time).pipe(
      switchMap(() => service.validateUrl(control.value)),
      map(res => {
        return res ? null : {invalidAsync: true};
      })
    );
  };
};

export function PatternValidator(control: AbstractControl, pattern: RegExp) {
    return ('' + control.value).match(pattern) ? null : {validationFailed: true};
}

export function CommaSeparatedPatternValidator(control: AbstractControl, pattern: RegExp) {
    return validateArray(('' + control.value).split(','), pattern);
}

export function validateArray(array: Array<string>, pattern: RegExp) {
    let ret = null;
    for (let e of array) {
        if (('' + e).match(pattern) === null) {
            ret = {validationFailed: true};
            break;
        }
    }
    return ret;
}
