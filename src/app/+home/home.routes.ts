import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.components';
import { ModuleWithProviders } from '@angular/core';

export const homeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(homeRoutes);
