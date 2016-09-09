import { Routes } from '@angular/router';

import { NewsComponent } from './news.component';

export const NewsRoutes:Routes = [
  {
    path: 'news/:id',
    pathMatch: 'full',
    component: NewsComponent
  },
  {
    path: 'news',
    pathMatch: 'full',
    redirectTo: '/',
  }
];
