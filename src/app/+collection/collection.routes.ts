import { RouterConfig } from '@angular/router';

import { CollectionComponent } from './collection.component';

export const CollectionRoutes: RouterConfig = [
  {
    path: 'collection',
    pathMatch: 'full',
    component: CollectionComponent
  }
];
