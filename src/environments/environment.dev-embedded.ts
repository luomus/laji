/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.embedded,
  production: false,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.389',
  formWhitelist: ['JX.519', 'MHL.9', 'MHL.25', 'JX.652', 'MHL.1',  'MHL.3', 'MHL.23', 'MHL.33', 'MHL.6', 'MHL.35', 'MHL.41', 'MHL.43'],
  massForms: ['JX.519', 'JX.652', 'MHL.41', 'MHL.33A'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: 'MHL.33',
  municipalityMonitoring: 'MHL.35',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'MHL.36',
  lolifeForm: 'MHL.45',
  apiBase: 'https://dev-embedded.laji.fi/api',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self'
};
