import { RouterModule, Routes } from '@angular/router';
import { InvasiveComponent } from './invasive.component';
import { ModuleWithProviders } from '@angular/core';

export const invasiveRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: InvasiveComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(invasiveRoutes);
