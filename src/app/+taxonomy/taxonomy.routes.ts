import { RouterConfig } from '@angular/router';

import { TaxonComponent } from './taxon.component';
import {InfoCardComponent} from "./info-card/info-card.component";

export const TaxonomyRoutes: RouterConfig = [
  {
    path: 'taxon/:id',
    component: InfoCardComponent
  },
  {
    path: 'taxon',
    component: TaxonComponent
  }
];
