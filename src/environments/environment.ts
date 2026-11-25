// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  beta: false,
  MATOMO_URL: 'https://analytics.openaire.eu/',
  MATOMO_SITE: -1,
  FAQ_ENDPOINT: 'https://dl105.madgik.di.uoa.gr/faq/api',
  // API_ENDPOINT: '/eic-registry', // to change the end point go to proxy.conf.json file
  // API_ENDPOINT: '/openaire', // old API
  API_ENDPOINT: '/api', // to change the end point go to proxy.conf.json file
  AAI_LOGIN: '/oauth2/authorization/openaire',
  AAI_LOGOUT: '/logout',
  STATS_ENDPOINT: 'https://providers.eosc-portal.eu/stats-api/',
  API_TOKEN_ENDPOINT: '',
  projectName: 'OpenAIRE Catalogue',
  projectMail: 'example@oac.eu',
  serviceORresource: 'Resource',
  hasUserConsent: true,
  showHelpContent: false,
  privacyPolicyURL: '',
  marketplaceBaseURL: '',
  sentry: {
    dsn: 'https://c14ac91c2adaafb644a200288035d5d2@sentry.vereniki.athenarc.gr/6',
    environment: 'develop',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.2,
    replaysOnErrorSampleRate: 1.0
  },
  disableSentry: true
};
