/* eslint-disable max-len */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { Global } from './global';

export const environment = {
  type: Global.type.beta,
  base: 'https://beta.laji.fi',
  production: true,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.841',
  apiBase: 'https://beta.laji.fi/api',
  loginCheck: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/loginInfo',
  loginUrl: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/self',
  registerUrl: 'https://fmnh-ws-test-24.it.helsinki.fi/laji-auth/auth-sources/LOCAL/register',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api-dev.laji.fi',
  geoserver: 'https://geoserver-dev.laji.fi/geoserver',
  dashboardUrl: 'https://dashboard-dev.laji.fi',
  defaultLang: 'fi',
  displayDevRibbon: true
};
