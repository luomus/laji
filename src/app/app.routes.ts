import {Routes} from '@angular/router';

import { HomeRoutes } from './+home';
import { TaxonomyRoutes } from './+taxonomy';
import { ObservationRoutes } from './+observation';
import { CollectionRoutes } from './+collection';
import { InformationRoutes } from './+information';
import { NewsRoutes } from './+news';
import { HaSeKaRoutes } from './+haseka';
import { UserRoutes } from './+user';

export const rootRouterConfig: Routes = [
  ...HomeRoutes,
  ...TaxonomyRoutes,
  ...ObservationRoutes,
  ...CollectionRoutes,
  ...InformationRoutes,
  ...NewsRoutes,
  ...HaSeKaRoutes,
  ...UserRoutes
];

