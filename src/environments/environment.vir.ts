export const environment = {
  systemID: 'KE.601',
  formWhitelist: ['JX.519', 'JX.6485'],
  defaultForm: 'JX.519',
  nafiForm: 'JX.123648',
  wbcForm: 'MHL.3',
  namedPlaceForm: 'JX.6668',
  invasiveControlForm: '',
  loginUrl: '/user/virannomaiset',
  selfPage: 'https://login.laji.fi/self',
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
  }
};
