import { Global } from 'projects/laji/src/environments/global';

export const environment = {
  type: Global.type.birdAtlas,
  production: true,
  base: 'https://tulokset.lintuatlas.fi',
  lajiApiBasePath: 'https://laji.fi/api',
  atlasApiBasePath: 'https://atlas-api.rahtiapp.fi/api/v1',
  displayDevRibbon: false
};
