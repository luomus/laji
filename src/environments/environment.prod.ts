/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.prod,
  production: true,
  forceLogin: false,
  disableAnalytics: false,
  systemID: 'KE.389',
  formWhitelist: ['JX.519', 'MHL.9', 'MHL.25', 'JX.652', 'MHL.1', 'MHL.3', 'MHL.6'],
  massForms: ['JX.519', 'JX.652'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: '',
  municipalityMonitoringForm: '',
  apiBase: 'https://laji.fi/api',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'MHL.36',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self'
};
