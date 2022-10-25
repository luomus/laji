/* eslint-disable max-len */
import { Global } from './global';

export const environment = {
  type: Global.type.prod,
  base: 'http://localhost:3000',
  production: true,
  forceLogin: false,
  disableAnalytics: false,
  systemID: 'KE.542',
  apiBase: 'https://beta.laji.fi/api',
  loginCheck: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/loginInfo',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self',
  kerttuApi: 'https://kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api.rahtiapp.fi',
  geoserver: 'https://geoserver.laji.fi',
  defaultLang: 'fi',
  displayDevRibbon: false
};
