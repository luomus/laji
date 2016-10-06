import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewsComponent } from './news.component';

export const newsRoutes: Routes = [
  {
    path: ':id',
    pathMatch: 'full',
    component: NewsComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(newsRoutes);
