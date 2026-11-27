import {computed, inject, Injectable, signal} from '@angular/core';
import {MatomoTracker} from 'ngx-matomo-client';
import {Consent, CONSENT_COOKIE_NAME, CONSENT_MAX_AGE_DAYS, CONSENT_VERSION, LEGACY_COOKIE_NAME} from './cookie-consent.model';

/**
 * Keeps the visitor's cookie choices in a single first-party cookie and applies them to Matomo.
 *
 * The consent cookie is the only record of the choice. Matomo runs with `requireConsent: 'cookie'` (see app.config.ts):
 * it counts visits without cookies, and sets its own only after {@link save} records analytics consent.
 */
@Injectable({providedIn: 'root'})
export class CookieConsentService {
  private readonly tracker = inject(MatomoTracker);
  private readonly _consent = signal<Consent | null>(this.read());
  /** Whether Matomo has been told, during this page's lifetime, that cookie consent was given. */
  private matomoConsentGiven = false;

  /** The saved choice, or `null` if the visitor has not chosen yet (or the stored value is unusable). */
  readonly consent = this._consent.asReadonly();
  readonly hasChoice = computed(() => this._consent() !== null);
  /** Whether the cookie settings panel is (requested to be) open. */
  readonly settingsOpen = signal(false);

  constructor() {
    this.deleteCookie(LEGACY_COOKIE_NAME);
    this.applyToMatomo(this._consent()?.analytics === true);
  }

  open(): void {
    this.settingsOpen.set(true);
  }

  acceptAll(): void {
    this.save(true);
  }

  rejectAll(): void {
    this.save(false);
  }

  save(analytics: boolean): void {
    const consent: Consent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics,
      date: new Date().toISOString()
    };
    this.write(consent);
    this._consent.set(consent);
    this.applyToMatomo(analytics);
    this.settingsOpen.set(false);
  }

  private applyToMatomo(analytics: boolean): void {
    if (analytics) {
      // For this page load only, on purpose: it is re-applied from our cookie on every start, so Matomo
      // does not keep a second consent cookie of its own that could get out of sync.
      this.tracker.setCookieConsentGiven();
      this.matomoConsentGiven = true;
      return;
    }
    if (this.matomoConsentGiven) {
      // Withdraws consent given earlier in this page's lifetime: the app is a SPA, so Matomo would keep its cookies.
      this.tracker.forgetCookieConsentGiven();
      this.matomoConsentGiven = false;
    }
    // Also removes Matomo cookies set before consent was asked for.
    this.tracker.deleteCookies();
  }

  private read(): Consent | null {
    if (typeof document === 'undefined') {
      return null;
    }
    const prefix = `${CONSENT_COOKIE_NAME}=`;
    const entry = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(prefix));
    if (!entry) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(decodeURIComponent(entry.substring(prefix.length)));
      return this.isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private isValid(value: unknown): value is Consent {
    return typeof value === 'object' && value !== null
      && 'version' in value && value.version === CONSENT_VERSION
      && 'necessary' in value && value.necessary === true
      && 'analytics' in value && typeof value.analytics === 'boolean'
      && 'date' in value && typeof value.date === 'string';
  }

  private write(consent: Consent): void {
    if (typeof document === 'undefined') {
      return;
    }
    const expires = new Date(Date.now() + CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}`
      + `; Expires=${expires}; Path=/; SameSite=Lax${secure}`;
  }

  private deleteCookie(name: string): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
    }
  }
}
