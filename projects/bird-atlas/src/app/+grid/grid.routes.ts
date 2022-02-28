import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { GridIndexComponent } from './grid-index/grid-index.component';
import { GridInfoComponent } from './grid-info/grid-info.component';

export const routes: Routes = [
  {
    path: '',
    component: GridIndexComponent
  },
  {
    path: ':id',
    component: GridInfoComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
