/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.kerttuGlobal,
  base: 'https://punainenkirja.laji.fi',
  production: true,
  forceLogin: true,
  disableAnalytics: false,
  systemID: 'KE.542',
  apiBase: '/api',
  loginCheck: '',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api.rahtiapp.fi'
};
