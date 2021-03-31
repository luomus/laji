import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsComponent } from './news.component';
import { NotFoundComponent } from '../shared/not-found/not-found.component';

export const newsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: NotFoundComponent
  },
  {
    path: ':id',
    pathMatch: 'full',
    component: NewsComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(newsRoutes);
