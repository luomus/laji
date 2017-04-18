import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { HasekaComponent } from './haseka.component';
import { HaSeKaTermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { HaSeKaFormComponent } from './form/haseka-form.component';
import { NamedPlaceComponent } from './named-place/named-place/named-place.component';
import { RequestComponent } from './form-permission/request/request.component';
import { AdminComponent } from './form-permission/admin/admin.component';
import { IntroComponent } from './form-permission/admin/intro/intro.component';
import { AcceptComponent } from './form-permission/admin/accept/accept.component';
import { ManageComponent } from './form-permission/admin/manage/manage.component';

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
    path: 'fp/:collectionId/admin',
    component: AdminComponent,
    children: [
      {path: '', pathMatch: 'full', component: IntroComponent},
      {path: 'accept', pathMatch: 'full', component: AcceptComponent},
      {path: 'manage', pathMatch: 'full', component: ManageComponent}
    ]
  },
  {
    path: 'fp/:collectionId',
    pathMatch: 'full',
    component: RequestComponent
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
