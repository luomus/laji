/* eslint-disable max-len */
import { Global } from './global';

export const environment = {
  type: Global.type.embedded,
  base: 'https://embedded.laji.fi',
  production: true,
  disableAnalytics: true,
  systemID: 'KE.389',
  apiBase: '/api',
  loginCheck: 'https://login.laji.fi/loginInfo',
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
