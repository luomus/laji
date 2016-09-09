import {Routes} from '@angular/router';

import { TaxonComponent } from './taxon.component';
import {InfoCardComponent} from "./info-card/info-card.component";

export const TaxonomyRoutes: Routes = [
  {
    path: 'taxon/:id',
    pathMatch: 'full',
    component: InfoCardComponent
  },
  {
    path: 'taxon',
    pathMatch: 'full',
    component: TaxonComponent
  }
];
