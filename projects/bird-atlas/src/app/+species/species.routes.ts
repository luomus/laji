import { RouterModule, Routes } from '@angular/router';
import { SpeciesIndexComponent } from './species-index/species-index.component';
import { ModuleWithProviders } from '@angular/core';
import { SpeciesInfoComponent } from './species-info/species-info.component';
import { SpeciesComponent } from './species.component';

export const speciesRoutes: Routes = [
  {
    path: '',
    component: SpeciesComponent,
    children: [
      {
        path: '',
        component: SpeciesIndexComponent
      },
      {
        path: ':id',
        component: SpeciesInfoComponent
      }
    ]
  },
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(speciesRoutes);
