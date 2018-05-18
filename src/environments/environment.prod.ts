export const environment = {
  production: true,
  isEmbedded: false,
  forceLogin: false,
  disableAnalytics: false,
  forAuthorities: false,
  systemID: 'KE.389',
  formsTheme: {
    'MHL.6': '/nafi',
    'MHL.1': '/linjalaskenta',
    'MHL.27': '/linjalaskenta',
    'MHL.28': '/linjalaskenta',
    'MHL.3': '/talvilintu',
  },
  formWhitelist: ['JX.519', 'MHL.9', 'MHL.25', 'JX.652', 'MHL.6'],
  massForms: ['JX.519', 'JX.652'],
  defaultForm: 'JX.519',
  nafiForm: 'MHL.6',
  invasiveControlForm: '',
  apiBase: '/api',
  wbcForm: 'MHL.3',
  lineTransectForm: 'MHL.1',
  lineTransectEiVakioForm: 'MHL.27',
  lineTransectKartoitusForm: 'MHL.28',
  whichSpeciesForm: 'MHL.9',
  namedPlaceForm: 'JX.6668',
  loginUrl: 'https://login.laji.fi/login',
  selfPage: 'https://login.laji.fi/self',
  externalViewers: {
    'http://tun.fi/KE.3': 'https://kotka.luomus.fi/view?uri=%uri%'
  },
  sources: {
    kotka: 'KE.3'
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE'
};
