import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { ListComponent } from './list/list.component';
import { TaxonomyComponent } from './taxonomy.component';

export const taxonomyRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ListComponent
  },
  {
    path: ':id',
    pathMatch: 'full',
    component: TaxonomyComponent
  },
];
export const routing: ModuleWithProviders = RouterModule.forChild(taxonomyRoutes);
