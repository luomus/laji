// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  isEmbedded: false,
  forceLogin: false,
  disableAnalytics: true,
  forAuthorities: false,
  sourceKotka: 'KE.3',
  systemID: 'KE.389',
  formWhitelist: ['JX.519', 'JX.652', 'JX.111715', 'MHL.1', 'JX.123759', 'JX.123757', 'JX.123659', 'MHL.3', 'MHL.9', 'MHL.23'],
  massForms: ['JX.519', 'JX.652'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: 'JX.111715',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'JX.123608',
  apiBase: '/api',
  loginUrl: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login',
  selfPage: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/self',
  externalViewers: {
    'http://tun.fi/KE.3': 'https://kotka.luomus.fi/view?uri=%uri%'
  },
  sources: {
    kotka: 'KE.3'
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE'
};
