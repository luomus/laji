/* tslint:disable:max-line-length */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Global } from './global';

export const environment = {
  type: Global.type.kerttuGlobal,
  base: 'http://localhost:3000',
  production: false,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.542',
  apiBase: 'https://dev.laji.fi/api',
  loginCheck: '',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self',
  kerttuApi: 'http://localhost:5000',
  protaxApi: 'https://protax-api-protax-api-staging.rahtiapp.fi',
};
