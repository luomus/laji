/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.kerttuGlobal,
  base: 'https://kerttu-global-dev.laji.fi',
  production: true,
  forceLogin: true,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.1181',
  apiBase: '/api',
  loginCheck: '',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api-protax-api-staging.rahtiapp.fi',
  defaultLang: 'en'
};
