import { RouterConfig } from '@angular/router';

import { NewsComponent } from './news.component';

export const NewsRoutes:RouterConfig = [
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
