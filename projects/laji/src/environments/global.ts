export const Global = {
  type: {
    dev: 'dev',
    beta: 'beta',
    prod: 'prod',
    vir: 'vir',
    embedded: 'embedded',
    iucn: 'iucn'
  },
  forms: {
    datasets: 'MHL.67',
    default: 'JX.519',
    namedPlace: 'MHL.36',
    whichSpecies: 'MHL.9',
    collectionContest: 'MHL.25'
  },
  externalViewers: {
    'http://tun.fi/KE.3': 'https://kotka.luomus.fi/view?uri=%uri%'
  },
  oldThemeRouting: {
    'nafi': 'MHL.6',
    'linjalaskenta': 'MHL.1',
    'talvilintulaskenta': 'MHL.3',
    'vesilintulaskenta': 'MHL.65',
    'vieraslajit': 'MHL.33',
    'kunnat': 'MHL.35',
    'lolife': 'MHL.45',
    'lepakot': 'MHL.50',
    'valio': 'MHL.57',
    'syke-perhoset': 'MHL.59',
    'sieniatlas': 'JX.652',
    'pistelaskenta': 'MHL.75',
    'kiiltomadot': 'MHL.79',
  },
  oldThemeParents: {
    'MHL.1': 'MHL.1',
    'MHL.27': 'MHL.1',
    'MHL.28': 'MHL.1',
    'MHL.65': 'MHL.65',
    'MHL.66': 'MHL.65',
    'MHL.45': 'MHL.45',
    'MHL.45A': 'MHL.45'
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE',
  sources: {
    kotka: 'KE.3'
  },
  canHaveTemplate: [
    'JX.519',
    'MHL.6',
    'MHL.33',
    'MHL.35',
    'MHL.9',
    'MHL.25',
    'JX.5190'
  ],
  documentCountUnitProperties: [
    'count',
    'individualCount',
    'pairCount',
    'abundanceString',
    'maleIndividualCount',
    'femaleIndividualCount',
    'areaInSquareMeters'
  ],
  annotationTags: {
    'MMAN.3': {
      value: 'MMAN.3',
      quality: 'MMAN.typeNegativeQuality',
      type: 'negative'
    },
    'MMAN.5': {
      value: 'MMAN.5',
      quality: 'MMAN.typePositiveQuality',
      type: 'positive'
    },
    'MMAN.8': {
      value: 'MMAN.8',
      quality: 'MMAN.typeNegativeQuality',
      type: 'negative'
    },
    'MMAN.9': {
      value: 'MMAN.9',
      quality: 'MMAN.typeNegativeQuality',
      type: 'negative'
    },
    'MMAN.10': {
      value: 'MMAN.10',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.11': {
      value: 'MMAN.11',
      quality: 'MMAN.typeCensus',
      type: 'census'
    },
    'MMAN.12': {
      value: 'MMAN.12',
      quality: 'MMAN.typeCensus',
      type: 'census'
    },
    'MMAN.13': {
      value: 'MMAN.13',
      quality: '"MMAN.typeCensus',
      type: 'census'
    },
    'MMAN.14': {
      value: 'MMAN.14',
      quality: 'MMAN.typeInvasive',
      type: 'invasive'
    },
    'MMAN.15': {
      value: 'MMAN.15',
      quality: 'MMAN.typeInvasive',
      type: 'invasive'
    },
    'MMAN.16': {
      value: 'MMAN.16',
      quality: 'MMAN.typeInvasive',
      type: 'invasive'
    },
    'MMAN.17': {
      value: 'MMAN.17',
      quality: 'MMAN.typeInvasive',
      type: 'invasive'
    },
    'MMAN.18': {
      value: 'MMAN.18',
      quality: 'MMAN.typeInfo',
      type: 'info'
    },
    'MMAN.19': {
      value: 'MMAN.19',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.20': {
      value: 'MMAN.20',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.22': {
      value: 'MMAN.22',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.23': {
      value: 'MMAN.23',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.24': {
      value: 'MMAN.24',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.25': {
      value: 'MMAN.25',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.26': {
      value: 'MMAN.26',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.28': {
      value: 'MMAN.28',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.29': {
      value: 'MMAN.29',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.30': {
      value: 'MMAN.30',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.31': {
      value: 'MMAN.31',
      quality: 'MMAN.typeCheck',
      type: 'check'
    },
    'MMAN.32': {
      value: 'MMAN.32',
      quality: 'MMAN.typeAdmin',
      type: 'admin'
    },
    'MMAN.33': {
      value: 'MMAN.33',
      quality: 'MMAN.typeInfo',
      type: 'info'
    },
    'MMAN.50': {
      value: 'MMAN.50',
      quality: 'MMAN.typeAdmin',
      type: 'admin'
    },
    'MMAN.51': {
      value: 'MMAN.51',
      quality: 'MMAN.typeAdmin',
      type: 'admin'
    },
    /*'MMAN.52': {
      value: 'MMAN.52',
      quality: 'MMAN.typePositiveQuality',
      type: 'admin'
    }*/
  },
  limit: {
    simpleDownload: 10000
  },
  langs : {
    fi: "suomi",
    sv: "svenska",
    en: "english",
    se: "same",
    ru: "русский"
  }
};
