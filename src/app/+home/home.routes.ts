import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.components';
import { ModuleWithProviders } from '@angular/core';

export const HomeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(HomeRoutes);
