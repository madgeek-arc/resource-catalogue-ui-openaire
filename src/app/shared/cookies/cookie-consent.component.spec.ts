import {TestBed} from '@angular/core/testing';
import {MatomoTracker} from 'ngx-matomo-client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CookieConsentComponent} from './cookie-consent.component';
import {CookieConsentService} from './cookie-consent.service';
import {CONSENT_COOKIE_NAME} from './cookie-consent.model';

describe('CookieConsentComponent', () => {
  const show = vi.fn();
  const hide = vi.fn();

  beforeEach(() => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
    vi.stubGlobal('UIkit', {offcanvas: () => ({show, hide})});
    TestBed.configureTestingModule({providers: [{
      provide: MatomoTracker,
      useValue: {setCookieConsentGiven: vi.fn(), forgetCookieConsentGiven: vi.fn(), deleteCookies: vi.fn()}
    }]});
  });

  afterEach(() => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
    vi.unstubAllGlobals();
    show.mockClear();
    hide.mockClear();
  });

  const open = () => {
    const fixture = TestBed.createComponent(CookieConsentComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const button = (text: string, within: ParentNode = root) =>
      [...within.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent!.trim() === text)!;
    const banner = () => root.querySelector('.cookie-banner');
    const panel = root.querySelector<HTMLElement>('#cookie-consent-panel')!;
    return {fixture, root, button, banner, panel, service: TestBed.inject(CookieConsentService)};
  };

  it('shows the banner until the visitor accepts', () => {
    const {fixture, button, banner, service} = open();
    expect(banner()).not.toBeNull();

    button('Accept all', banner()!).click();
    fixture.detectChanges();

    expect(banner()).toBeNull();
    expect(service.consent()?.analytics).toBe(true);
  });

  it('hides the banner when the visitor rejects all', () => {
    const {fixture, button, banner, service} = open();

    button('Reject all', banner()!).click();
    fixture.detectChanges();

    expect(banner()).toBeNull();
    expect(service.consent()?.analytics).toBe(false);
  });

  it('opens the settings panel from the banner, and applies the analytics box only on save', () => {
    const {fixture, button, banner, panel, service} = open();

    button('Settings', banner()!).click();
    fixture.detectChanges();
    expect(show).toHaveBeenCalledTimes(1);

    const analytics = panel.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:not([disabled])');
    expect(analytics.length).toBe(1);
    expect(analytics[0].checked).toBe(false);
    analytics[0].click();
    fixture.detectChanges();
    expect(service.hasChoice()).toBe(false);

    button('Save settings', panel).click();
    fixture.detectChanges();
    expect(service.consent()?.analytics).toBe(true);
    expect(service.settingsOpen()).toBe(false);
  });

  it('marks the panel closed when UIkit hides it', () => {
    const {fixture, panel, service} = open();
    service.open();
    fixture.detectChanges();

    panel.dispatchEvent(new CustomEvent('hidden'));

    expect(service.settingsOpen()).toBe(false);
  });
});
