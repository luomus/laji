/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.iucn,
  base: 'https://punainenkirja.laji.fi',
  systemID: 'KE.601',
  formWhitelist: [],
  massForms: ['JX.519'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  waterbirdPairForm: 'MHL.65',
  waterbirdJuvenileForm: 'MHL.66',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'MHL.36',
  invasiveControlForm: '',
  municipalityMonitoringForm: '',
  batForm: 'MHL.50',
  valioForm: 'MHL.57',
  lolifeForm: 'MHL.45',
  saveObservations: {
    citizenScienceForms: ['JX.652', 'MHL.6', 'MHL.51', 'MHL.25'],
    birdMonitoringForms: ['MHL.1', 'MHL.3'],
    researchProjects: ['MHL.33', 'MHL.50', 'MHL.57']
  },
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  apiBase: '/api',
  production: true,
  forceLogin: true,
  disableAnalytics: false,
  kerttuApi: 'https://staging-kerttu-backend.laji.fi'
};
