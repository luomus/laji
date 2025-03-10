/* eslint-disable max-len */
import { Global } from 'projects/laji/src/environments/global';

export const environment = {
  type: Global.type.kerttuGlobal,
  base: 'https://kerttu-global-dev.laji.fi',
  production: true,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.1181',
  apiBase: '/api',
  loginCheck: '',
  loginUrl: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/self',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api-dev.laji.fi',
  geoserver: 'https://geoserver-dev.laji.fi/geoserver',
  dashboardUrl: 'https://dashboard-dev.laji.fi',
  defaultLang: 'en',
  languages: ['en', 'es', 'fr'],
  displayDevRibbon: true
};
