import { RouterModule, Routes } from '@angular/router';
import { HerpetologyComponent } from './herpetology.component';
import { ModuleWithProviders } from '@angular/core';

export const herpetologyRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HerpetologyComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(herpetologyRoutes);
