import { Global } from 'projects/laji/src/environments/global';

export const environment = {
  type: Global.type.birdAtlas,
  production: false,
  base: 'https://tuloksia-dev.lintuatlas.fi',
  lajiApiBasePath: 'https://dev.laji.fi/api',
  atlasApiBasePath: 'https://atlas-api-dev.rahtiapp.fi/api/v1'
};
