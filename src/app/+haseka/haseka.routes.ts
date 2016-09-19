import { Routes } from '@angular/router';

import {HaSeKaComponent} from "./haseka.component";
import {HaSeKaFormComponent} from "./form/haseka-form.component";
import {HaSeKaTermsOfServiceComponent} from "./terms-of-service/terms-of-service.component";

export const HaSeKaRoutes: Routes = [
  {
    path: 'haseka',
    pathMatch: 'full',
    component: HaSeKaComponent
  },
  {
    path: 'haseka/termsOfService',
    pathMatch: 'full',
    component: HaSeKaTermsOfServiceComponent
  },
  {
    path: 'haseka/:formId',
    pathMatch: 'full',
    component: HaSeKaFormComponent
  },
  {
    path: 'haseka/:formId/:documentId',
    pathMatch: 'full',
    component: HaSeKaFormComponent
  }
];
