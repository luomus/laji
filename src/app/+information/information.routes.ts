import { Routes, RouterModule } from '@angular/router';
import { InformationComponent } from './information.component';
import { ModuleWithProviders } from '@angular/core';

export const informationRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: InformationComponent
  }, {
    path: ':id',
    pathMatch: 'full',
    component: InformationComponent
  },
];

export const routing: ModuleWithProviders = RouterModule.forChild(informationRoutes);
