import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { EmbeddedObservationMapComponent } from './embedded-observation-map.component';

export const embeddedObservationMapRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: EmbeddedObservationMapComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(embeddedObservationMapRoutes);
