/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.vir,
  base: 'https://viranomaiset.laji.fi',
  systemID: 'KE.601',
  formWhitelist: ['JX.519', 'JX.6485'],
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
  lolifeForm: '',
  batForm: 'MHL.50',
  valioForm: 'MHL.57',
  birdPointCountForm: 'MHL.75',
  sykeButterflyForm: 'MHL.59',
  saveObservations: {
    citizenScienceForms: ['MHL.3', 'JX.652', 'MHL.53'],
    birdMonitoringForms: ['MHL.65', 'MHL.33', 'MHL.6'],
    researchProjects: ['MHL.1', 'MHL.50', 'MHL.57']
  },
  loginUrl: '/user/viranomaiset',
  selfPage: 'https://login.laji.fi/self',
  apiBase: '/api',
  production: true,
  forceLogin: true,
  disableAnalytics: true,
  waterbirdPairForm: 'MHL.65',
  waterbirdJuvenileForm: 'MHL.66',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi'
};
