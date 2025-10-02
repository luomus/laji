/* eslint-disable max-len */
import { Global } from './global';

export const environment = {
  type: Global.type.embedded,
  base: 'https://dev-embedded.laji.fi',
  production: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.389',
  apiBase: 'https://dev-embedded.laji.fi/api',
  loginCheck: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/loginInfo',
  loginUrl: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/self',
  registerUrl: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/auth-sources/LOCAL/register',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api-dev.laji.fi',
  geoserver: 'https://geoserver-dev.laji.fi/geoserver',
  dashboardUrl: 'https://dashboard-dev.laji.fi',
  defaultLang: 'fi',
  displayDevRibbon: true
};
