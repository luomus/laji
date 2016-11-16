import { Routes, RouterModule } from '@angular/router';
import { ObservationComponent } from './observation.component';
import { ModuleWithProviders } from '@angular/core';

export const observationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'map'
  },
  {
    path: ':tab',
    pathMatch: 'full',
    component: ObservationComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(observationRoutes);
