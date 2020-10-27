import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { HasekaComponent } from './haseka.component';
import { HaSeKaTermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { HaSeKaFormComponent } from './form/haseka-form.component';
import { DocumentDeActivateGuard } from '../shared/guards/document-de-activate.guard';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { TemplatesComponent } from './templates/templates.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { HasekaFeedbackComponent } from './haseka-feedback/haseka-feedback.component';
import { VihkoHomeComponent } from './vihko-home/vihko-home.component';
import { TemplateHasekaFormComponent } from './template-haseka-form/template-haseka-form.component';

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
          {path: '', pathMatch: 'full', redirectTo: 'home'},
          {path: 'home', pathMatch: 'full', component: VihkoHomeComponent},
          {path: 'forms', pathMatch: 'full', redirectTo: 'home'},
          {path: 'ownSubmissions', pathMatch: 'full', canActivate: [OnlyLoggedIn], component: OwnSubmissionsComponent},
          {path: 'templates', pathMatch: 'full', canActivate: [OnlyLoggedIn], component: TemplatesComponent},
          {path: 'tools',  canActivate: [OnlyLoggedIn], loadChildren: () => import('./tools/tools.module').then(m => m.ToolsModule)},
        ]
      },
      {
        path: 'terms-of-service',
        pathMatch: 'full',
        component: HaSeKaTermsOfServiceComponent
      },
      {
        path: 'template',
        children: [
          {
            path: ':formId',
            pathMatch: 'full',
            canActivate: [OnlyLoggedIn],
            component: TemplateHasekaFormComponent,
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
      },
      {
        path: ':formId',
        pathMatch: 'full',
        canActivate: [OnlyLoggedIn],
        component: HaSeKaFormComponent,
        canDeactivate: [DocumentDeActivateGuard],
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
