import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { GenericComponent } from './generic.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const errorRoutes: Routes = [
  {
    path: '',
    redirectTo: '404'
  },
  {
    path: '404',
    pathMatch: 'full',
    component: NotFoundComponent
  },
  {
    path: '500',
    pathMatch: 'full',
    component: GenericComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(errorRoutes);
