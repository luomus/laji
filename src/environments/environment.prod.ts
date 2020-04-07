/* tslint:disable:max-line-length */
import { Global } from './global';

export const environment = {
  type: Global.type.prod,
  base: 'https://laji.fi',
  production: true,
  forceLogin: false,
  disableAnalytics: false,
  systemID: 'KE.389',
  formWhitelist: ['MHL.51', 'JX.519', 'MHL.9', 'MHL.53', 'MHL.25', 'JX.652', 'MHL.1', 'MHL.3', 'MHL.6', 'MHL.33', 'MHL.50', 'MHL.57'],
  massForms: ['JX.519', 'JX.652', 'MHL.33A'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: 'MHL.33',
  municipalityMonitoringForm: '',
  lolifeForm: '',
  apiBase: 'https://laji.fi/api',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'MHL.36',
  batForm: 'MHL.50',
  valioForm: 'MHL.57',
  saveObservations: {
    citizenScienceForms: ['JX.652', 'MHL.6', 'MHL.51', 'MHL.25'],
    birdMonitoringForms: ['MHL.1', 'MHL.3'],
    researchProjects: ['MHL.33', 'MHL.50', 'MHL.57']
  },
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self'
};
