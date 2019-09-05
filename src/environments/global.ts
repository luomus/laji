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
    lolifeForm: 'MHL.45',
    wbc: 'MHL.3',
    lineTransect: 'MHL.1',
    lineTransectEiVakio: 'MHL.27',
    lineTransectKartoitus: 'MHL.28',
    whichSpecies: 'MHL.9',
    namedPlace: 'MHL.36',
    collectionContest: 'MHL.25',
    bats: 'MHL.50',
    valio: 'MHL.57',
    batForm: 'MHL.50',
    valioForm: 'MHL.57',
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
    municipalityMonitoring: 'HR.2891'
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
    'MHL.45': '/lolife',
    'MHL.50': '/lepakot',
    'MHL.57': '/valio',
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
      quality: 'negative'
    },
    'MMAN.5': {
      value: 'MMAN.5',
      quality: 'positive'
    },
    'MMAN.6': {
      value: 'MMAN.6',
      quality: 'positive'
    },
    'MMAN.7': {
      value: 'MMAN.7',
      quality: 'neutral'
    },
    'MMAN.8': {
      value: 'MMAN.8',
      quality: 'negative'
    },
    'MMAN.9': {
      value: 'MMAN.9',
      quality: 'negative'
    },
    'MMAN.10': {
      value: 'MMAN.10',
      quality: 'check'
    },
    'MMAN.11': {
      value: 'MMAN.11',
      quality: 'check'
    },
    'MMAN.12': {
      value: 'MMAN.12',
      quality: 'negative'
    },
    'MMAN.13': {
      value: 'MMAN.13',
      quality: 'negative'
    },
    'MMAN.14': {
      value: 'MMAN.14',
      quality: 'check'
    },
    'MMAN.15': {
      value: 'MMAN.15',
      quality: 'check'
    },
    'MMAN.16': {
      value: 'MMAN.16',
      quality: 'neutral'
    },
    'MMAN.17': {
      value: 'MMAN.17',
      quality: 'negative'
    },
    'MMAN.18': {
      value: 'MMAN.18',
      quality: 'negative'
    },
    'MMAN.19': {
      value: 'MMAN.19',
      quality: 'negative'
    },
    'MMAN.20': {
      value: 'MMAN.20',
      quality: 'check'
    },
    'MMAN.21': {
      value: 'MMAN.21',
      quality: 'check'
    },
    'MMAN.22': {
      value: 'MMAN.22',
      quality: 'check'
    },
    'MMAN.23': {
      value: 'MMAN.23',
      quality: 'check'
    },
    'MMAN.24': {
      value: 'MMAN.24',
      quality: 'check'
    },
    'MMAN.25': {
      value: 'MMAN.25',
      quality: 'check'
    },
    'MMAN.26': {
      value: 'MMAN.26',
      quality: 'check'
    },
    'MMAN.27': {
      value: 'MMAN.27',
      quality: 'check'
    },
    'MMAN.28': {
      value: 'MMAN.28',
      quality: 'negative'
    },
    'MMAN.29': {
      value: 'MMAN.29',
      quality: 'negative'
    },
    'MMAN.30': {
      value: 'MMAN.30',
      quality: 'check'
    }
  }
};
