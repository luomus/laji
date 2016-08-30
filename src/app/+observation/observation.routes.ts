import { RouterConfig } from '@angular/router';

import { ObservationComponent } from './observation.component';

export const ObservationRoutes: RouterConfig = [
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
