import {Routes, RouterModule} from '@angular/router';

import { CollectionComponent } from './collection.component';
import {ModuleWithProviders} from "@angular/core";

export const CollectionRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CollectionComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(CollectionRoutes);
