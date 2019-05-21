import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { HasekaComponent } from './haseka.component';
import { HaSeKaFormListComponent } from './form-list/haseka-form-list';
import { StatisticsComponent } from '../shared-modules/statistics/statistics.component';
import { HaSeKaTermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { HaSeKaFormComponent } from './form/haseka-form.component';
import { NpPrintComponent } from '../shared-modules/named-place/np-print/np-print.component';
import { RequestWrapperComponent } from './form-permission/request/request-wrapper.component';
import { AdminComponent } from './form-permission/admin/admin.component';
import { IntroComponent } from './form-permission/admin/intro/intro.component';
import { AcceptComponent } from './form-permission/admin/accept/accept.component';
import { ManageComponent } from './form-permission/admin/manage/manage.component';
import { DocumentDeActivateGuard } from '../shared/guards/document-de-activate.guard';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { TemplatesComponent } from './templates/templates.component';
import { NamedPlaceWrapperComponent } from './named-place-wrapper/named-place-wrapper.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { HasekaFeedbackComponent } from './haseka-feedback/haseka-feedback.component';

export const hasekaRoutes: Routes = [
  {
    path: '',
    // Feedback button is handled globally everywhere else but on Vihko forms, since the button shouldn't be shown on some forms.
    component: HasekaFeedbackComponent,
    children: [
      {
        path: '',
        component: HasekaComponent,
        children: [
          {path: '', pathMatch: 'full', component: HaSeKaFormListComponent},
          {path: 'forms', pathMatch: 'full', component: HaSeKaFormListComponent},
          {path: 'ownSubmissions', pathMatch: 'full', canActivate: [OnlyLoggedIn], component: OwnSubmissionsComponent},
          {path: 'templates', pathMatch: 'full', canActivate: [OnlyLoggedIn], component: TemplatesComponent},
          {path: 'statistics', pathMatch: 'full', canActivate: [OnlyLoggedIn], component: StatisticsComponent},
          {path: 'statistics/:documentID', pathMatch: 'full', canActivate: [OnlyLoggedIn], component: StatisticsComponent},
          {path: 'tools',  canActivate: [OnlyLoggedIn], loadChildren: './tools/tools.module#ToolsModule'},
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
        canActivate: [OnlyLoggedIn],
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
        canActivate: [OnlyLoggedIn],
        component: RequestWrapperComponent
      },
      {
        path: ':formId',
        pathMatch: 'full',
        canActivate: [OnlyLoggedIn],
        component: HaSeKaFormComponent,
        data: {
          displayFeedback: false
        }
      },
      {
        path: ':formId/:documentId',
        pathMatch: 'full',
        canActivate: [OnlyLoggedIn],
        component: HaSeKaFormComponent,
        canDeactivate: [DocumentDeActivateGuard],
        data: {
          displayFeedback: false
        }
      }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(hasekaRoutes);
