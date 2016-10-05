import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from "@angular/core";

import { HomeRoutes } from './+home';
import { TaxonomyRoutes } from './+taxonomy';
import { ObservationRoutes } from './+observation';
import { CollectionRoutes } from './+collection';

export const appRoutes: Routes = [
  { path: 'news', loadChildren: './+news/news.module#NewsModule'},
  { path: 'information', loadChildren: './+information/information.module#InformationModule'},
  { path: 'user', loadChildren: './+user/user.module#UserModule'},
  { path: 'haseka', loadChildren: './+haseka/haseka.module#HasekaModule'},
  { path: 'observation', loadChildren: './+observation/observation.module#ObservationModule'},
  ...HomeRoutes,
  ...TaxonomyRoutes,
  ...CollectionRoutes
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
