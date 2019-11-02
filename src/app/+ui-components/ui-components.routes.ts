import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UiComponentsComponent } from './ui-components.component';

export const routes: Routes = [
  {
    path: '',
    component: UiComponentsComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
