import { Routes } from '@angular/router';

import { InformationComponent } from './information.component';

export const InformationRoutes: Routes = [
  {
    path: 'information',
    pathMatch: 'full',
    component: InformationComponent
  },  {
    path: 'information/:id',
    pathMatch: 'full',
    component: InformationComponent
  },
];
