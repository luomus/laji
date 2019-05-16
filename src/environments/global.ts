const forms = {
    default: 'JX.519',
    nafi: 'MHL.6',
    invasiveControl: 'MHL.33',
    municipalityMonitoring: 'MHL.35',
    lolife: 'MHL.45',
    wbc: 'MHL.3',
    lineTransect: 'MHL.1',
    lineTransectEiVakio: 'MHL.27',
    lineTransectKartoitus: 'MHL.28',
    whichSpecies: 'MHL.9',
    namedPlace: 'MHL.36',
    collectionContest: 'MHL.25',
    bats: 'MHL.50'
};
const themeFormIdToName = Object.keys(forms).reduce((names, name) => {
  names[forms[name]] = name;
  return names;
}, {});
const collections = {
  nafi: 'HR.175',
  wbc: 'HR.39',
  lineTransect: 'HR.61',
  lineTransectEiVakio: 'HR.2691',
  lineTransectKartoitus: 'HR.2692',
  invasiveControl: 'HR.2049',
  municipalityMonitoring: 'HR.2891'
};
const themeForms = {
  [forms.nafi]: {
    path: 'nafi',
    title: 'NAFI',
    navLinks: {
      templates: {
        routerLink: ['templates'],
        label: 'haseka.templates.title'
      },
      stats: {
        routerLink: ['../nafi', 'stats'],
        label: 'nafi.stats'
      },
    },
    navLinksOrder: ['instructions', 'stats', 'form', 'ownSubmissions', 'templates'],
    instructions: '2668',
  },
  [forms.lineTransect]: {
    path: 'linjalaskenta',
    title: 'lineTransect.title',
    navLinks: {
      'form': {
        label: 'Vakiolinjat ja ilmoittaminen',
        accessLevel: undefined
      },
      'ei-vakiolinjat': {
        routerLink: ['../linjalaskenta', 'ei-vakiolinjat'],
        label: 'Ei-vakiolinjat',
        activeMatch: `/places/${collections.lineTransectEiVakio}`
      },
      'kartoitus': {
        routerLink: ['../linjalaskenta', 'kartoitus'],
        label: 'Kartoituslaskennat',
        activeMatch: `/places/${collections.lineTransectKartoitus}`
      },
      'stats': {
        routerLink: ['../linjalaskenta', 'stats'],
        label: 'Tulokset'
      }
    },
    navLinksOrder: ['instructions', 'stats', 'form', 'ei-vakiolinjat', 'kartoitus', 'ownSubmissions', 'formPermissions'],
    hideNavFor: ['/form']
  },
  [forms.wbc]: {
    path: 'talvilintulaskenta',
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
  },
  [forms.invasiveControl]: {
    path: 'vieraslajit',
    title: 'Vieras&shy;lajit',
    instructions: '2661',
    navLinks: {
      form: {
        label: 'invasiveSpecies.places'
      }
    }
  },
  [forms.municipalityMonitoring]: {
    path: 'kunnat',
    title: 'Kuntalomake',
    instructions: '2666',
    navLinks: {
      form: {
        label: 'invasiveSpecies.places'
      }
    }
  },
  [forms.lolife]: {
    path: 'lolife',
    title: 'LOLIFE'
  },
  [forms.bats]: {
    path: 'lepakot',
    title: 'Lepakko&shy;lomake',
    navLinks: {
      form: {
        visible: false
      },
      ownSubmissions: {
        visible: false
      }
    }
  }
};
export const Global = {
  type: {
    dev: 'dev',
    prod: 'prod',
    vir: 'vir',
    embedded: 'embedded',
    iucn: 'iucn'
  },
  forms,
  themeForms: Object.keys(themeForms).reduce((_themeForms, id) => ({
    ..._themeForms,
    [id]: {...themeForms[id], formID: id, name: themeFormIdToName[id], noFormPermissionRedirect: `/theme/${themeForms[id].path}`}
  }), {}),
  canHaveTemplate: [
    'JX.519',
    'MHL.6',
    'MHL.33',
    'MHL.35',
    'MHL.9',
    'MHL.25'
  ],
  collections,
  externalViewers: {
    'http://tun.fi/KE.3': 'https://kotka.luomus.fi/view?uri=%uri%'
  },
  googleApiKey: 'AIzaSyCtGFaUCGx1J8GxuTwMZqmcpxGFzTUWZWE',
  sources: {
    kotka: 'KE.3'
  }
};
