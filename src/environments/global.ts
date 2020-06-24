export const Global = {
  type: {
    dev: 'dev',
    prod: 'prod',
    vir: 'vir',
    embedded: 'embedded',
    iucn: 'iucn'
  },
  forms: {
    datasets: 'MHL.67',
    default: 'JX.519',
    nafi: 'MHL.6',
    invasiveControl: 'MHL.33',
    municipalityMonitoringForm: 'MHL.35',
    lolifeForm: 'MHL.45',
    lolifeExcelForm: 'MHL.45A',
    wbc: 'MHL.3',
    lineTransect: 'MHL.1',
    lineTransectEiVakio: 'MHL.27',
    lineTransectKartoitus: 'MHL.28',
    fungi: 'JX.652',
    waterbirdPairForm: 'MHL.65',
    waterbirdJuvenileForm: 'MHL.66',
    whichSpecies: 'MHL.9',
    namedPlace: 'MHL.36',
    collectionContest: 'MHL.25',
    bats: 'MHL.50',
    valio: 'MHL.57',
    batForm: 'MHL.50',
    valioForm: 'MHL.57',
    sykeButterfly: 'MHL.59',
    birdPointCount: 'MHL.75',
    glowWormForm: 'MHL.79'
  },
  _forms: {
    'MHL.3': {
      formID: 'MHL.3',
      navLinks: {
        stats: {
          routerLink: ['stats'],
          label: 'nafi.stats',
          children: [
            {
              routerLink: ['stats', 'species'],
              label: 'wbc.stats.species'
            },
            {
              routerLink: ['stats', 'routes'],
              label: 'wbc.stats.routes'
            },
            {
              routerLink: ['stats', 'censuses'],
              label: 'wbc.stats.censuses'
            }
          ]
        }
      },
      navLinksOrder: ['instructions', 'stats', 'form', 'ownSubmissions', 'formPermissions']
    }
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
    lineTransect: 'HR.61',
    lineTransectEiVakio: 'HR.2691',
    lineTransectKartoitus: 'HR.2692',
    invasiveControl: 'HR.2049',
    municipalityMonitoring: 'HR.2891',
    sykeButterfly: 'HR.3431',
    waterbird: 'HR.62',
    birdPointCount: 'HR.157',
    glowFormForm: 'HR.3531',
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
    'MHL.65': '/vesilintulaskenta',
    'MHL.66': '/vesilintulaskenta',
    'MHL.33': '/vieraslajit',
    'MHL.35': '/kunnat',
    'MHL.45': '/lolife',
    'MHL.50': '/lepakot',
    'MHL.57': '/valio',
    'MHL.59': '/syke-perhoset',
    'JX.652': '/sieniatlas',
    'MHL.75': '/pistelaskenta',
    'MHL.79': '/kiiltomadot',
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE',
  sources: {
    kotka: 'KE.3'
  },
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
  }
};
