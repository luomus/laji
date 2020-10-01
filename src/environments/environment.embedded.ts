/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.embedded,
  base: 'https://embedded.laji.fi',
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
  lolifeForm: '',
  apiBase: '/api',
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
    citizenScienceForms: ['MHL.3', 'JX.652', 'MHL.53'],
    birdMonitoringForms: ['MHL.65', 'MHL.33', 'MHL.6'],
    researchProjects: ['MHL.1', 'MHL.50', 'MHL.57']
  },
  loginCheck: 'https://login.laji.fi/loginInfo',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api-protax-api-staging.rahtiapp.fi'
};
