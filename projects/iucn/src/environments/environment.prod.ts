/* eslint-disable max-len */
import { Global } from './global';

export const environment = {
  type: Global.type.iucn,
  base: 'https://punainenkirja.laji.fi',
  production: true,
  forceLogin: true,
  disableAnalytics: false,
  systemID: 'KE.601',
  apiBase: '/api',
  loginCheck: 'https://login.laji.fi/loginInfo',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api.laji.fi',
  geoserver: 'https://geoserver.laji.fi/geoserver',
  dashboardUrl: 'https://dashboard.laji.fi',
  displayDevRibbon: false
};
