import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SaveObservationsComponent } from './save-observations.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'prefix',
    component: SaveObservationsComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
