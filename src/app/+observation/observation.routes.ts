import { Routes, RouterModule } from '@angular/router';
import { ObservationComponent } from './observation.component';
import { ModuleWithProviders } from '@angular/core';

export const ObservationRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ObservationComponent
  },
  {
    path: ':tab',
    pathMatch: 'full',
    component: ObservationComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(ObservationRoutes);
