import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from "@angular/core";

import { HasekaComponent } from './haseka.component';
import { HaSeKaTermsOfServiceComponent } from "./terms-of-service/terms-of-service.component";
import { HaSeKaFormComponent } from "./form/haseka-form.component";

export const HasekaRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HasekaComponent
  },
  {
    path: 'termsOfService',
    pathMatch: 'full',
    component: HaSeKaTermsOfServiceComponent
  },
  {
    path: ':formId',
    pathMatch: 'full',
    component: HaSeKaFormComponent
  },
  {
    path: ':formId/:documentId',
    pathMatch: 'full',
    component: HaSeKaFormComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(HasekaRoutes);
