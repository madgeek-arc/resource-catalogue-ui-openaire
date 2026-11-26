import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Observable, timer} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {FormControlService} from '../../services/form-control.service';

export const urlRegEx = /^(https?:\/\/.+){0,1}$/;       //http// or https//
export const oneDecimal = /^(\d)*(\.)?([0-9]{1})?$/;    //Only digits and one decimal

/**
 * The API's default patterns for email and phone fields, as its validator (madgeek-arc/catalogue,
 * ModelResponseValidator) checks them on save. Angular's Validators.email is looser: it accepts a domain with no dot,
 * such as name@host, which the API then rejects as "Field '…' is invalid".
 */
export const emailRegEx = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
export const phoneRegEx = /^(((\+)|(00))[1-9]\d{0,2}( )?)?((\(\d{2,4}\))|\d{2,4})[- .]?\d{2,4}[- .]?\d{3,5}$/;

/**
 * Checks a value as the API does: trimmed, an empty one passes (required says whether it may be empty), and the rest
 * must match `pattern` whole. The error is {pattern: …}, as Validators.pattern gives.
 */
export function apiPatternValidator(pattern: RegExp | string): ValidatorFn {
  const whole = typeof pattern === 'string' ? new RegExp(`^(?:${pattern})$`) : pattern;
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return whole.test(String(value)) ? null : {pattern: {requiredPattern: String(whole), actualValue: control.value}};
  };
}

export const emailValidator = apiPatternValidator(emailRegEx);
export const phoneValidator = apiPatternValidator(phoneRegEx);

export function URLValidator(): ValidatorFn { //TODO Please validate me
  return (control: AbstractControl): ValidationErrors | null => {
    const pattern = /^(https?:\/\/.+){0,1}$/;
    const url = pattern.test(control.value);
    return url ? {url: {value: control.value}} : null;
  };
}

/** Increase time var to reduce server calls **/
export const urlAsyncValidator = (formControlService: FormControlService, time = 0) => {
  return (control: AbstractControl): Observable<ValidationErrors> => {
    if (control.value === '' || control.value === null) {
      return timer(time).pipe(map(() => {
        return new Observable<ValidationErrors>();
        })
      );
    }
    return timer(time).pipe(
      switchMap(() => formControlService.validateUrl(control.value)),
      map(res => {
        return res ? new Observable<ValidationErrors>() : {invalidAsync: true};
      })
    );
  };
};
