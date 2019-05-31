/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.iucn,
  systemID: 'KE.601',
  formWhitelist: [],
  massForms: ['JX.519'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'MHL.36',
  invasiveControlForm: '',
  municipalityMonitoringForm: '',
  batForm: 'MHL.50',
  valioForm: 'MHL.57',
  lolifeForm: 'MHL.45',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  apiBase: '/api',
  production: true,
  forceLogin: true,
  disableAnalytics: false
};
