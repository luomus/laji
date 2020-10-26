/* tslint:disable:max-line-length */

import { Global } from './global';

export const environment = {
  type: Global.type.vir,
  base: 'https://viranomaiset-dev.laji.fi',
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
  glowWormForm: 'MHL.79',
  saveObservations: {
    citizenScienceForms: ['JX.652', 'MHL.6', 'MHL.51', 'MHL.25'],
    birdMonitoringForms: ['MHL.1', 'MHL.3'],
    researchProjects: ['MHL.33', 'MHL.50', 'MHL.57']
  },
  rootCollections: ['HR.128'],
  loginUrl: '/user/viranomaiset',
  selfPage: 'https://login.laji.fi/self',
  apiBase: '/api',
  production: true,
  forceLogin: true,
  disableAnalytics: true,
  waterbirdPairForm: 'MHL.65',
  waterbirdJuvenileForm: 'MHL.66',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  globalMessageIds: {
    '\/observation.*': {
      fi: '3999',
      sv: '4367',
      en: ''
    },
    '\/taxon\/.*\/taxonomy': {
      fi: '4011',
      sv: '4353',
      en: ''
    },
    '\/taxon\/.*': {
      fi: '3995',
      sv: '4341',
      en: ''
    },
    '\/taxon.*': {
      fi: '3997',
      sv: '4375',
      en: ''
    },
    '\/usage\/my-downloads.*': {
      fi: '4238',
      sv: '4363',
      en: ''
    },
    '\/usage\/downloads.*': {
      fi: '4005',
      sv: '4358',
      en: ''
    },
    '\/usage\/by-organization.*': {
      fi: '4003',
      sv: '4355',
      en: ''
    },
    '\/usage.*': {
      fi: '4001',
      sv: '4378',
      en: ''
    },
  }
};
