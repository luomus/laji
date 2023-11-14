import { Global } from './global';

export const environment = {
  type: Global.type.beta,
  base: 'http://localhost:3000',
  production: false,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.542',
  apiBase: 'https://beta.laji.fi/api',
  loginCheck: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/loginInfo',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api-protax-api-staging.rahtiapp.fi',
  geoserver: 'https://geoserver-dev.laji.fi',
  dashboardUrl: 'https://dashboard-dev.laji.fi',
  defaultLang: 'fi',
  displayDevRibbon: true
};
