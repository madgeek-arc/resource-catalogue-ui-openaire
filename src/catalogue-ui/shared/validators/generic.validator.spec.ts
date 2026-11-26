import {FormControl} from '@angular/forms';
import {describe, expect, it} from 'vitest';
import {apiPatternValidator, emailValidator, phoneValidator} from './generic.validator';

const valid = (validator: typeof emailValidator, value: unknown) => validator(new FormControl(value)) === null;

describe('the API\'s field patterns', () => {
  it('accepts an email only when its domain has a dot and a top-level domain, as the API does', () => {
    expect(valid(emailValidator, 'name@example.org')).toBe(true);
    expect(valid(emailValidator, 'first.last+tag@sub.Example.co.uk')).toBe(true);
    expect(valid(emailValidator, ' name@example.org ')).toBe(true);
    // Validators.email accepts these; the API answers "Field '…' is invalid".
    expect(valid(emailValidator, 'name@host')).toBe(false);
    expect(valid(emailValidator, 'name@example.o')).toBe(false);
    expect(valid(emailValidator, 'na me@example.org')).toBe(false);
  });

  it('accepts the phone formats the API accepts', () => {
    for (const phone of ['+30 210 1234567', '00302101234567', '(210) 123-4567', '210-123-4567', '2101234567']) {
      expect(valid(phoneValidator, phone), phone).toBe(true);
    }
    for (const phone of ['123', 'phone', '+30']) {
      expect(valid(phoneValidator, phone), phone).toBe(false);
    }
  });

  it('lets an empty value through, for required to judge', () => {
    for (const empty of ['', '  ', null, undefined]) {
      expect(valid(emailValidator, empty)).toBe(true);
    }
  });

  it('matches a model\'s own pattern whole', () => {
    const validator = apiPatternValidator('[a-z]+@openaire\\.eu');
    expect(valid(validator, 'team@openaire.eu')).toBe(true);
    expect(valid(validator, 'team@openaire.eu.evil.org')).toBe(false);
    expect(validator(new FormControl('x@y.org'))).toEqual({pattern: {requiredPattern: '/^(?:[a-z]+@openaire\\.eu)$/', actualValue: 'x@y.org'}});
  });
});
