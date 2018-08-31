/* tslint:disable:max-line-length */
export const environment = {
  systemID: 'KE.601',
  formsTheme: {
    'MHL.6': '/nafi',
    'MHL.1': '/linjalaskenta',
    'MHL.27': '/linjalaskenta',
    'MHL.28': '/linjalaskenta',
    'MHL.3': '/talvilintu',
  },
  formWhitelist: ['JX.519', 'JX.6485'],
  massForms: ['JX.519'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'JX.6668',
  invasiveControlForm: '',
  loginUrl: '/user/viranomaiset',
  selfPage: 'https://login.laji.fi/self',
  apiBase: '/api',
  production: true,
  isEmbedded: false,
  forceLogin: true,
  disableAnalytics: true,
  forAuthorities: true,
  externalViewers: {
    'http://tun.fi/KE.3': 'https://kotka.luomus.fi/view?uri=%uri%'
  },
  sources: {
    kotka: 'KE.3'
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE'
};
