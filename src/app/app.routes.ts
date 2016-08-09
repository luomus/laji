import { provideRouter, RouterConfig } from '@angular/router';

import { HomeRoutes } from './+home';
import { TaxonomyRoutes } from './+taxonomy';
import { ObservationRoutes } from './+observation';
import { CollectionRoutes } from './+collection';
import { InformationRoutes } from './+information';
import { NewsRoutes } from './+news';
import { HaSeKaRoutes } from './+haseka';
import { UserRoutes } from './+user';

const routes: RouterConfig = [
  ...HomeRoutes,
  ...TaxonomyRoutes,
  ...ObservationRoutes,
  ...CollectionRoutes,
  ...InformationRoutes,
  ...NewsRoutes,
  ...HaSeKaRoutes,
  ...UserRoutes
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
