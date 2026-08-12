import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ModuleWithProviders } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
