/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.prod,
  base: 'https://laji.fi',
  production: true,
  forceLogin: false,
  disableAnalytics: false,
  systemID: 'KE.389',
  formWhitelist: ['MHL.51', 'JX.519', 'MHL.9', 'MHL.53', 'MHL.25', 'JX.652', 'MHL.1', 'MHL.3', 'MHL.6', 'MHL.33', 'MHL.50', 'MHL.57', , 'MHL.65', 'MHL.45', 'MHL.75', 'MHL.59', 'MHL.79'],
  massForms: ['JX.519', 'JX.652', 'MHL.33A', 'MHL.45A'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: 'MHL.33',
  municipalityMonitoringForm: '',
  lolifeForm: 'MHL.45',
  apiBase: 'https://laji.fi/api',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  waterbirdPairForm: 'MHL.65',
  waterbirdJuvenileForm: 'MHL.66',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'MHL.36',
  batForm: 'MHL.50',
  valioForm: 'MHL.57',
  birdPointCountForm: 'MHL.75',
  sykeButterflyForm: 'MHL.59',
  glowWormForm: 'MHL.79',
  saveObservations: {
    citizenScienceForms: ['JX.652', 'MHL.6', 'MHL.53', 'MHL.25', 'MHL.79'],
    birdMonitoringForms: ['MHL.1', 'MHL.3', 'MHL.65', 'MHL.75'],
    researchProjects: ['MHL.33', 'MHL.50', 'MHL.57', 'MHL.45', 'MHL.59']
  },
  loginCheck: 'https://login.laji.fi/loginInfo',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://kerttu-backend.laji.fi'
};
