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
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE',
  sources: {
    kotka: 'KE.3'
  }
};
