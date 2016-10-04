import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewsComponent } from './news.component';

export const NewsRoutes:Routes = [
  {
    path: ':id',
    pathMatch: 'full',
    component: NewsComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(NewsRoutes);
