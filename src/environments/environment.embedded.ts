/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.embedded,
  production: true,
  forceLogin: false,
  disableAnalytics: true,
  systemID: 'KE.389',
  formWhitelist: [],
  massForms: [],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: '',
  municipalityMonitoringForm: '',
  apiBase: '/api',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'MHL.36',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self'
};
