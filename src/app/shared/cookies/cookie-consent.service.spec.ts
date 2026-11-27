import {TestBed} from '@angular/core/testing';
import {MatomoTracker} from 'ngx-matomo-client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CookieConsentService} from './cookie-consent.service';
import {CONSENT_COOKIE_NAME, CONSENT_VERSION, LEGACY_COOKIE_NAME} from './cookie-consent.model';

const trackerStub = () => ({setCookieConsentGiven: vi.fn(), forgetCookieConsentGiven: vi.fn(), deleteCookies: vi.fn()});

describe('CookieConsentService', () => {
  let tracker: ReturnType<typeof trackerStub>;

  const clearCookies = () => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
    document.cookie = `${LEGACY_COOKIE_NAME}=; Max-Age=0; Path=/`;
  };

  const setRawCookie = (value: string) => {
    document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/`;
  };

  const configure = () => {
    tracker = trackerStub();
    TestBed.configureTestingModule({providers: [{provide: MatomoTracker, useValue: tracker}]});
  };

  const create = () => TestBed.inject(CookieConsentService);

  beforeEach(() => {
    clearCookies();
    configure();
  });

  afterEach(clearCookies);

  it('has no choice when there is no cookie, and keeps Matomo cookieless', () => {
    const service = create();

    expect(service.hasChoice()).toBe(false);
    expect(service.consent()).toBeNull();
    expect(tracker.deleteCookies).toHaveBeenCalled();
    expect(tracker.setCookieConsentGiven).not.toHaveBeenCalled();
  });

  it('does not withdraw Matomo consent for visitors who never gave it', () => {
    const service = create();
    expect(tracker.forgetCookieConsentGiven).not.toHaveBeenCalled();

    service.rejectAll();

    expect(tracker.forgetCookieConsentGiven).not.toHaveBeenCalled();
    expect(tracker.deleteCookies).toHaveBeenCalled();
  });

  it('ignores a corrupt cookie instead of throwing', () => {
    setRawCookie('%7Bnot-json');

    expect(create().hasChoice()).toBe(false);
  });

  it('ignores a cookie written with another schema version', () => {
    setRawCookie(encodeURIComponent(JSON.stringify({functional: true, preferences: true, analytics: true})));

    expect(create().hasChoice()).toBe(false);
    expect(tracker.setCookieConsentGiven).not.toHaveBeenCalled();
  });

  it('stores analytics consent on Accept all and tells Matomo', () => {
    const service = create();

    service.acceptAll();

    expect(service.consent()?.analytics).toBe(true);
    expect(service.consent()?.version).toBe(CONSENT_VERSION);
    expect(document.cookie).toContain(`${CONSENT_COOKIE_NAME}=`);
    expect(tracker.setCookieConsentGiven).toHaveBeenCalledTimes(1);
  });

  it('withdraws Matomo consent and deletes its cookies on Reject all after accepting', () => {
    const service = create();
    service.acceptAll();
    tracker.deleteCookies.mockClear();

    service.rejectAll();

    expect(service.consent()?.analytics).toBe(false);
    expect(tracker.forgetCookieConsentGiven).toHaveBeenCalledTimes(1);
    expect(tracker.deleteCookies).toHaveBeenCalledTimes(1);
  });

  it('restores a saved choice on start and applies it to Matomo again', () => {
    create().acceptAll();
    TestBed.resetTestingModule();
    configure();

    const service = create();

    expect(service.hasChoice()).toBe(true);
    expect(service.consent()?.analytics).toBe(true);
    expect(tracker.setCookieConsentGiven).toHaveBeenCalledTimes(1);
    expect(tracker.forgetCookieConsentGiven).not.toHaveBeenCalled();
  });

  it('closes the settings panel when a choice is saved', () => {
    const service = create();
    service.open();
    expect(service.settingsOpen()).toBe(true);

    service.save(false);

    expect(service.settingsOpen()).toBe(false);
  });

  it('deletes the old notice\'s cookie on start', () => {
    document.cookie = `${LEGACY_COOKIE_NAME}=true; Path=/`;

    create();

    expect(document.cookie).not.toContain(LEGACY_COOKIE_NAME);
  });
});
