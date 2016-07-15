import { RouterConfig } from '@angular/router';

import { TaxonComponent } from './taxon.component';

export const TaxonomyRoutes: RouterConfig = [
  {
    path: 'taxon/:id',
    component: TaxonComponent
  },
  {
    path: 'taxon',
    redirectTo: '/',
  }
];
