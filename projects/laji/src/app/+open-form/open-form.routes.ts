import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpenFormComponent } from './open-form/open-form.component';
import { AboutComponent } from '../+project-form/about/about.component';

export const routes: Routes = [
  {
    path: '',
    component: OpenFormComponent
  },
  {
    path: 'about',
    pathMatch: 'prefix',
    component: AboutComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
