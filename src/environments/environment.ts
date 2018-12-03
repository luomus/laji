/* tslint:disable:max-line-length */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { Global } from './global';

export const environment = {
  type: Global.type.dev,
  production: false,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.389',
  formWhitelist: ['JX.519', 'MHL.9', 'MHL.25', 'JX.652', 'MHL.1',  'MHL.3', 'MHL.23', 'MHL.33', 'JX.123659', 'MHL.6'],
  massForms: ['JX.519', 'JX.652'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: 'MHL.33',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'MHL.36',
  apiBase: 'https://dev.laji.fi/api',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self'
};
