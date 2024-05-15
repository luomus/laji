/* eslint-disable max-len */
import { Global } from 'projects/laji/src/environments/global';

export const environment = {
  type: Global.type.kerttuGlobal,
  base: 'https://bsg.laji.fi',
  production: true,
  forceLogin: false,
  disableAnalytics: false,
  systemID: 'KE.1441',
  apiBase: '/api',
  loginCheck: '',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api.rahtiapp.fi',
  geoserver: 'https://geoserver.laji.fi/geoserver',
  dashboardUrl: 'https://dashboard.laji.fi',
  defaultLang: 'en',
  languages: ['en', 'es', 'fr'],
  displayDevRibbon: false
};
