import { RouterConfig } from '@angular/router';

import { InformationComponent } from './information.component';

export const InformationRoutes: RouterConfig = [
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
