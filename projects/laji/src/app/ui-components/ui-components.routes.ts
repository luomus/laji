import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UiComponentsComponent } from './ui-components.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'prefix',
    component: UiComponentsComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
