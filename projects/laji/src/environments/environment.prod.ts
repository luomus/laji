/* eslint-disable max-len */
import { Global } from './global';

export const environment = {
  type: Global.type.prod,
  base: 'https://laji.fi',
  production: true,
  disableAnalytics: false,
  systemID: 'KE.389',
  apiBase: 'https://laji.fi/api',
  loginCheck: 'https://login.laji.fi/loginInfo',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api.laji.fi',
  geoserver: 'https://geoserver.laji.fi/geoserver',
  dashboardUrl: 'https://dashboard.laji.fi',
  defaultLang: 'fi',
  displayDevRibbon: false
};
