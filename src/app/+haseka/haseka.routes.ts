import { Routes } from '@angular/router';

import {HaSeKaComponent} from "./haseka.component";
import {HaSeKaFormComponent} from "./form/haseka-form.component";

export const HaSeKaRoutes: Routes = [
  {
    path: 'haseka',
    pathMatch: 'full',
    component: HaSeKaComponent
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
