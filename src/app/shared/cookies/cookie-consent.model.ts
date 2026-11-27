export const CONSENT_COOKIE_NAME = 'consent';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 395;

/** The cookie the old notice set; deleted on start, since nothing reads it any more. */
export const LEGACY_COOKIE_NAME = 'cookieLawSeen';

export const COOKIES_POLICY_URL = 'https://www.openaire.eu/cookies-policy';

export interface Consent {
  /** Bump {@link CONSENT_VERSION} when categories change, so that visitors are asked again. */
  version: number;
  /** Strictly necessary cookies cannot be switched off. */
  necessary: true;
  analytics: boolean;
  /** ISO date of the moment the choice was made. */
  date: string;
}

export interface CookieInfo {
  name: string;
  description: string;
  provider: string;
  expiration: string;
}

export interface CookieCatalog {
  necessary: CookieInfo[];
  analytics: CookieInfo[];
}

/** Cookies this website (or the services it loads) may set, shown in the cookie settings panel. */
export const COOKIE_CATALOG: CookieCatalog = {
  necessary: [
    {
      name: CONSENT_COOKIE_NAME,
      description: 'Stores your cookie choices, so that you are not asked again.',
      provider: 'OpenAIRE Catalogue',
      expiration: '13 months'
    },
    {
      name: 'SESSION',
      description: 'Identifies your signed-in session on the server, so that you stay signed in while you browse.',
      provider: 'OpenAIRE Catalogue',
      expiration: 'Session'
    }
  ],
  analytics: [
    {
      name: '_pk_id.*',
      description: 'Stores a few details about the visitor, such as a unique visitor ID.',
      provider: 'Matomo',
      expiration: '13 months'
    },
    {
      name: '_pk_ses.*',
      description: 'Short-lived cookie that temporarily stores data for the current visit.',
      provider: 'Matomo',
      expiration: '30 minutes'
    },
    {
      name: '_pk_ref.*',
      description: 'Stores the referrer that brought you to the website.',
      provider: 'Matomo',
      expiration: '6 months'
    }
  ]
};
