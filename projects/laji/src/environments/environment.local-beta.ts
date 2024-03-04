import { Global } from './global';

export const environment = {
  type: Global.type.beta,
  base: 'http://localhost:3000',
  production: false,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.1081',
  apiBase: 'https://laji.fi/api',
  loginCheck: '/loginInfo',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api-protax-api-staging.rahtiapp.fi',
  geoserver: 'https://geoserver-dev.laji.fi',
  dashboardUrl: 'https://dashboard-dev.laji.fi',
  defaultLang: 'fi',
  displayDevRibbon: true
};
