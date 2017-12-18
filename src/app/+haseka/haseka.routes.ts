import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { HasekaComponent } from './haseka.component';
import { HaSeKaFormListComponent } from './form-list/haseka-form-list';
import { StatisticsComponent } from './statistics/statistics.component';
import { HaSeKaTermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { HaSeKaFormComponent } from './form/haseka-form.component';
import { NpPrintComponent } from '../shared-modules/named-place/np-print/np-print.component';
import { RequestComponent } from './form-permission/request/request.component';
import { AdminComponent } from './form-permission/admin/admin.component';
import { IntroComponent } from './form-permission/admin/intro/intro.component';
import { AcceptComponent } from './form-permission/admin/accept/accept.component';
import { ManageComponent } from './form-permission/admin/manage/manage.component';
import { NamedPlaceComponent } from '../shared-modules/named-place/named-place/named-place.component';
import { DocumentDeActivateGuard } from '../shared/document-form/document-de-activate.guard';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { TemplatesComponent } from './templates/templates.component';
import { NamedPlaceWrapperComponent } from './named-place-wrapper/named-place-wrapper.component';

export const hasekaRoutes: Routes = [
  {
    path: '',
    component: HasekaComponent,
    children: [
      {path: '', pathMatch: 'full', component: HaSeKaFormListComponent},
      {path: 'forms', pathMatch: 'full', component: HaSeKaFormListComponent},
      {path: 'ownSubmissions', pathMatch: 'full', component: OwnSubmissionsComponent},
      {path: 'templates', pathMatch: 'full', component: TemplatesComponent},
      {path: 'statistics', pathMatch: 'full', component: StatisticsComponent},
      {path: 'statistics/:documentID', pathMatch: 'full', component: StatisticsComponent}
    ]
  },
  {
    path: 'terms-of-service',
    pathMatch: 'full',
    component: HaSeKaTermsOfServiceComponent
  },
  {
    path: 'places/:npId/print/:type',
    component: NpPrintComponent
  },
  {
    path: 'places/:collectionId/:formId',
    pathMatch: 'full',
    component: NamedPlaceWrapperComponent
  },
  {
    path: 'fp/:collectionId/admin',
    component: AdminComponent,
    children: [
      {path: '', pathMatch: 'full', component: IntroComponent},
      {path: 'accept', pathMatch: 'full', component: AcceptComponent},
      {path: 'manage/:type', pathMatch: 'full', component: ManageComponent}
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
    component: HaSeKaFormComponent,
    canDeactivate: [DocumentDeActivateGuard]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(hasekaRoutes);
