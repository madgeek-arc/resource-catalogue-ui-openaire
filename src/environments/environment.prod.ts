export const environment = {
  production: true,
  beta: false,
  MATOMO_URL: 'https://analytics.openaire.eu/',
  MATOMO_SITE: 147,
  FAQ_ENDPOINT: '/faq/api',
  API_ENDPOINT: '/api',
  COOKIE_DOMAIN: '.openaire.eu',
  STATS_ENDPOINT: 'https://providers.eosc-portal.eu/stats-api/',
  API_TOKEN_ENDPOINT: '',
  AAI_LOGIN: '/oauth2/authorization/openaire',
  AAI_LOGOUT: 'https://aai.openaire.eu/proxy/saml2/idp/SingleLogoutService.php?ReturnTo=',
  projectName: 'OpenAIRE Catalogue',
  projectMail: 'example@oac.eu',
  serviceORresource: 'Resource',
  hasUserConsent: false,
  privacyPolicyURL: '',
  marketplaceBaseURL: '',
  showHelpContent: false,
  sentry: {
    dsn: 'https://c14ac91c2adaafb644a200288035d5d2@sentry.vereniki.athenarc.gr/6',
    environment: 'production',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0
  },
  disableSentry: false
};
