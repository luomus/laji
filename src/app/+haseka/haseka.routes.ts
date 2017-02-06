import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { HasekaComponent } from './haseka.component';
import { HaSeKaTermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { HaSeKaFormComponent } from './form/haseka-form.component';
import { NamedPlaceComponent } from './named-place/named-place/named-place.component';

export const hasekaRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HasekaComponent
  },
  {
    path: 'terms-of-service',
    pathMatch: 'full',
    component: HaSeKaTermsOfServiceComponent
  },
  {
    path: 'np/:collectionId/:formId',
    pathMatch: 'full',
    component: NamedPlaceComponent
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

export const routing: ModuleWithProviders = RouterModule.forChild(hasekaRoutes);
