import {ChangeDetectorRef, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {filter, merge, Observable, startWith, switchMap} from 'rxjs';

/**
 * Every event (value, status, touched, dirty) of a control and of the controls under it. It follows controls that are
 * added or removed later: a group or array changes its own value when that happens, and the children are listened to
 * again. Needed because `markAllAsTouched()` tells each control separately, not the controls above it.
 */
export function controlTreeEvents(control: AbstractControl): Observable<unknown> {
  if (!(control instanceof FormGroup || control instanceof FormArray)) {
    return control.events;
  }
  const children = control.events.pipe(
    filter(event => event.source === control),
    startWith(null),
    switchMap(() => merge(...Object.values(control.controls).map(controlTreeEvents)))
  );
  return merge(control.events, children);
}

/**
 * For an OnPush form field, whose template reads the state of its control (valid, touched, enabled, value): returns a
 * function that, given that control, refreshes the field whenever the control or one under it changes, whoever changes
 * it (the field itself, another field it depends on, or the survey patching and validating the whole form).
 * Call it in a field initializer; call the function it returns once the control is known.
 */
export function formFieldRefresher(): (control: AbstractControl) => void {
  const changeDetector = inject(ChangeDetectorRef);
  const destroyRef = inject(DestroyRef);
  return control => {
    controlTreeEvents(control).pipe(takeUntilDestroyed(destroyRef)).subscribe(() => changeDetector.markForCheck());
  };
}
