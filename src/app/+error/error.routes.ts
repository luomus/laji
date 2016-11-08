import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { GenericComponent } from './generic.component';

export const errorRoutes: Routes = [
  {
    path: '',
    redirectTo: '500'
  },
  {
    path: '500',
    pathMatch: 'full',
    component: GenericComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(errorRoutes);
