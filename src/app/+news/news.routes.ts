import { RouterConfig } from '@angular/router';

import { NewsComponent } from './news.component';

export const NewsRoutes:RouterConfig = [
  {
    path: 'news/:id',
    component: NewsComponent
  },
  {
    path: 'news',
    redirectTo: '/',
  }
];
