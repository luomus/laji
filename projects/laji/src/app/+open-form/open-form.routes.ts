import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpenFormComponent } from './open-form/open-form.component';

export const routes: Routes = [
  {
    path: '',
    component: OpenFormComponent,
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
