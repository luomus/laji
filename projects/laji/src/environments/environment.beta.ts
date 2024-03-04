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
  systemID: 'KE.1081',
  apiBase: 'https://laji.fi/api',
  loginCheck: '/loginInfo',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  kerttuApi: 'https://staging-kerttu-backend.laji.fi',
  protaxApi: 'https://protax-api-protax-api-staging.rahtiapp.fi',
  geoserver: 'https://geoserver-dev.laji.fi',
  dashboardUrl: 'https://dashboard-dev.laji.fi',
  defaultLang: 'fi',
  displayDevRibbon: true
};
