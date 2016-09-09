import { Routes } from '@angular/router';

import { ObservationComponent } from './observation.component';

export const ObservationRoutes: Routes = [
  {
    path: 'observation',
    pathMatch: 'full',
    component: ObservationComponent
  },
  {
    path: 'observation/:tab',
    pathMatch: 'full',
    component: ObservationComponent
  }
];
