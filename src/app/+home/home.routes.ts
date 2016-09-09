import { Routes } from '@angular/router';

import { HomeComponent } from './home.components';

export const HomeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  }
];
