/* eslint-disable max-len */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { Global } from './global';

export const environment = {
  type: Global.type.vir,
  base: 'http://localhost:3000',
  production: false,
  forceLogin: false,
  disableAnalytics: true,
  sourceKotka: 'KE.3',
  systemID: 'KE.542',
  rootCollections: ['HR.128'],
  apiBase: 'https://dev.laji.fi/api',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self',
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
  },
  geoserver: 'https://geoserver-dev.laji.fi/geoserver',
  observationMapOptions: {availableOverlayNameBlacklist: []},
  displayDevRibbon: true
};
