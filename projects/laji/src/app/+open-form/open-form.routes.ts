import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpenFormComponent } from './open-form/open-form.component';
import { OpenFormThankYouComponent } from './open-form-thank-you/open-form-thank-you.component';

export const routes: Routes = [
  {
    path: '',
    component: OpenFormComponent
  },
  {
    path: 'thank-you',
    pathMatch: 'prefix',
    component: OpenFormThankYouComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
