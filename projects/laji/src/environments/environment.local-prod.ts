import { Global } from './global';

export const environment = {
  type: Global.type.beta,
  base: 'http://localhost:3000',
  production: true,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.1081',
  apiBase: 'https://laji.fi/api',
  loginCheck: '/loginInfo',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  registerUrl: 'https://login.laji.fi/auth-sources/LOCAL/register',
  kerttuApi: 'https://kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api.laji.fi',
  geoserver: 'https://geoserver.laji.fi/geoserver',
  dashboardUrl: 'https://dashboard.laji.fi',
  defaultLang: 'fi',
  displayDevRibbon: false
};
