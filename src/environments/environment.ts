/* tslint:disable:max-line-length */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { Global } from './global';

export const environment = {
  type: Global.type.dev,
  base: 'https://dev.laji.fi',
  production: false,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.389',
  formWhitelist: ['JX.519', 'JX.5190', 'MHL.9', 'MHL.25', 'JX.652', 'MHL.1',  'MHL.3', 'MHL.23', 'MHL.33', 'MHL.6', 'MHL.35', 'MHL.41', 'MHL.43', 'MHL.45', 'MHL.51', 'MHL.53', 'MHL.50', 'MHL.57',  'MHL.59', 'MHL.65', 'MHL.75'],
  massForms: ['JX.519', 'JX.652', 'MHL.41', 'MHL.33A'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: 'MHL.33',
  municipalityMonitoringForm: 'MHL.35',
  lolifeForm: 'MHL.45',
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
  saveObservations: {
    citizenScienceForms: ['JX.652', 'MHL.6', 'MHL.53', 'MHL.25'],
    birdMonitoringForms: ['MHL.1', 'MHL.65', 'MHL.3', 'MHL.75'],
    researchProjects: ['MHL.33', 'MHL.35', 'MHL.50', 'MHL.57', 'MHL.45', 'MHL.59']
  },
  apiBase: 'https://dev.laji.fi/api',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi'
};
