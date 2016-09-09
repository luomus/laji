import { Routes } from '@angular/router';

import { CollectionComponent } from './collection.component';

export const CollectionRoutes: Routes = [
  {
    path: 'collection',
    pathMatch: 'full',
    component: CollectionComponent
  }
];
