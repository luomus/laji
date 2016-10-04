import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from "@angular/core";

import { HomeRoutes } from './+home';
import { TaxonomyRoutes } from './+taxonomy';
import { ObservationRoutes } from './+observation';
import { CollectionRoutes } from './+collection';
import { InformationRoutes } from './+information';
import { NewsRoutes } from './+news';
import { HaSeKaRoutes } from './+haseka';
import { UserRoutes } from './+user';

export const appRoutes: Routes = [
  { path: 'news', loadChildren: './+news/news.module#NewsModule'},
  ...HomeRoutes,
  ...TaxonomyRoutes,
  ...ObservationRoutes,
  ...CollectionRoutes,
  ...InformationRoutes,
  ...HaSeKaRoutes,
  ...UserRoutes
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
