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
    invasiveControl: 'MHL.33',
    municipalityMonitoringForm: 'MHL.35',
    wbc: 'MHL.3',
    lineTransect: 'MHL.1',
    lineTransectEiVakio: 'MHL.27',
    lineTransectKartoitus: 'MHL.28',
    whichSpecies: 'MHL.9',
    namedPlace: 'MHL.36',
    collectionContest: 'MHL.25',
    lolifeForm: 'MHL.45',
  },
  canHaveTemplate: [
    'JX.519',
    'MHL.6',
    'MHL.33',
    'MHL.35',
    'MHL.9',
    'MHL.25'
  ],
  collections: {
    nafi: 'HR.175',
    wbc: 'HR.39',
    lineTransect: 'HR.61'
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
    'MHL.33': '/vieraslajit',
    'MHL.35': '/kunnat',
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE',
  sources: {
    kotka: 'KE.3'
  }
};
