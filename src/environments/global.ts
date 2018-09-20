export const Global = {
  type: {
    dev: 'dev',
    prod: 'prod',
    vir: 'vir',
    embedded: 'embedded',
    iucn: 'iucn'
  },
  forms: {
    default: 'JX.519',
    nafi: 'MHL.6',
    invasiveControl: 'JX.111716',
    wbc: 'MHL.3',
    lineTransect: 'MHL.1',
    lineTransectEiVakio: 'MHL.27',
    lineTransectKartoitus: 'MHL.28',
    whichSpecies: 'MHL.9',
    namedPlace: 'JX.123608'
  },
  externalViewers: {
    'http://tun.fi/KE.3': 'https://kotka.luomus.fi/view?uri=%uri%'
  },
  formsTheme: {
    'MHL.6': '/nafi',
    'MHL.1': '/linjalaskenta',
    'MHL.27': '/linjalaskenta',
    'MHL.28': '/linjalaskenta',
    'MHL.3': '/talvilintu',
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE',
  selfPage: 'https://login.laji.fi/self',
  sources: {
    kotka: 'KE.3'
  }
};
