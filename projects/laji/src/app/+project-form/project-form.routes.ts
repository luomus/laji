import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectFormComponent } from './project-form.component';
import { AboutComponent } from './about/about.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { AdminComponent } from './form-permission/admin/admin.component';
import { IntroComponent } from './form-permission/admin/intro/intro.component';
import { AcceptComponent } from './form-permission/admin/accept/accept.component';
import { ManageComponent } from './form-permission/admin/manage/manage.component';
import { ParticipantsComponent } from './form-permission/admin/participants/participants.component';
import { ImportComponent } from './import/import.component';
import { GenerateSpreadsheetComponent } from './generate-spreadsheet/generate-spreadsheet.component';
import { TemplatesComponent } from './templates/templates.component';
import { HasAdminPermission } from './guards/has-admin-permission';
import { HasFormPermission } from './guards/has-form-permission';

export const routes: Routes = [
  {
    path: ':projectID',
    component: ProjectFormComponent,
    children : [
      {path: 'about', component: AboutComponent},
      {path: 'instructions', component: InstructionsComponent, canActivate: [OnlyLoggedIn, HasFormPermission]},
      {path: 'stats', loadChildren: () => import('./results/results.module').then(m => m.ResultsModule)},
      {
        path: 'submissions',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        loadChildren: () => import('./submissions/submissions.module').then(m => m.SubmissionsModule)
      },
      {path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule)},
      {
        path: 'admin',
        canActivate: [OnlyLoggedIn, HasAdminPermission],
        component: AdminComponent,
        children: [
          {path: '', redirectTo: 'instructions'},
          {path: 'instructions', component: IntroComponent},
          {path: 'accept', pathMatch: 'full', component: AcceptComponent},
          {path: 'manage/:type', pathMatch: 'full', component: ManageComponent},
          {path: 'participants', pathMatch: 'full', component: ParticipantsComponent},
        ]
      },
      {
        path: 'import',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        component: ImportComponent
      },
      {
        path: 'generate',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        component: GenerateSpreadsheetComponent
      },
      {
        path: 'templates',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        component: TemplatesComponent
      }
    ]
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
