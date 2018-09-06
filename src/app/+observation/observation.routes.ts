import { RouterModule, Routes } from '@angular/router';
import { ObservationComponent } from './observation.component';
import { ModuleWithProviders } from '@angular/core';
import { ResetComponent } from './reset/reset.component';

export const observationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ResetComponent
      },
      {
        path: ':tab',
        pathMatch: 'full',
        component: ObservationComponent,
        data: {
          noScrollToTop: true
        }
      }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(observationRoutes);
