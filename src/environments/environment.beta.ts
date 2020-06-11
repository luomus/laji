/* tslint:disable:max-line-length */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { Global } from './global';

export const environment = {
  type: Global.type.prod,
  base: 'https://beta.laji.fi',
  production: true,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.841',
  formWhitelist: ['MHL.51', 'JX.519', 'MHL.9', 'MHL.53', 'MHL.25', 'JX.652', 'MHL.1', 'MHL.3', 'MHL.6', 'MHL.33', 'MHL.50', 'MHL.57', 'MHL.79'],
  massForms: ['JX.519', 'JX.652', 'MHL.33A', 'MHL.45A'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: 'MHL.33',
  municipalityMonitoringForm: '',
  lolifeForm: '',
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
    researchProjects: ['MHL.33', 'MHL.35', 'MHL.50', 'MHL.57', 'MHL.45', 'MHL.59']
  },
  apiBase: 'https://beta.laji.fi/api',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi'
};
