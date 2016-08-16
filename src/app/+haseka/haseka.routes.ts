import { RouterConfig } from '@angular/router';

import {HaSeKaComponent} from "./haseka.component";
import {HaSeKaFormComponent} from "./form/haseka-form.component";

export const HaSeKaRoutes: RouterConfig = [
  {
    path: 'haseka',
    component: HaSeKaComponent
  },
  {
    path: 'haseka/:formId',
    component: HaSeKaFormComponent
  }
];
