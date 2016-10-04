import { Routes } from '@angular/router';

import { TaxonComponent } from './taxon.component';
import { InfoCardComponent } from "./info-card/info-card.component";

export const TaxonomyRoutes: Routes = [
  {
    path: 'taxon',
    pathMatch: 'full',
    redirectTo: 'taxon/browse/informal'
  },
  {
    path: 'taxon/browse/taxonomy',
    pathMatch: 'full',
    redirectTo: 'taxon/browse/taxonomy/MX.53761'
  },
  {
    path: 'taxon/browse/:type',
    pathMatch: 'full',
    component: TaxonComponent
  },
  {
    path: 'taxon/browse/:type/:id',
    pathMatch: 'full',
    component: TaxonComponent
  },
  {
    path: 'taxon/:id',
    pathMatch: 'full',
    component: InfoCardComponent
  },
];
