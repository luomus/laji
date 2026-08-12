import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { ObserversComponent } from './observers.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ObserversComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

