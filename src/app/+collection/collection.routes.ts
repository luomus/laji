import { RouterModule, Routes } from '@angular/router';
import { CollectionComponent } from './collection.component';
import { ModuleWithProviders } from '@angular/core';

export const collectionRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CollectionComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(collectionRoutes);
