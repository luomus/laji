import { RouterConfig } from '@angular/router';

import { HomeComponent } from './home.components';

export const HomeRoutes: RouterConfig = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  }
];
