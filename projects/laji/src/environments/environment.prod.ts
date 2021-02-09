/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.prod,
  base: 'https://laji.fi',
  production: true,
  forceLogin: false,
  disableAnalytics: false,
  systemID: 'KE.389',
  apiBase: 'https://laji.fi/api',
  loginCheck: 'https://login.laji.fi/loginInfo',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api.rahtiapp.fi'
};
