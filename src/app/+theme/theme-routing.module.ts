import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NafiComponent } from './nafi/nafi.component';
import { NafiResultComponent } from './nafi/nafi-result/nafi-result.component';
import { NafiFormComponent } from './nafi/nafi-form/nafi-form.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { NafiMyDocumentListComponent } from './nafi/nafi-my-document-list/nafi-my-document-list.component';
import { NafiInstructionsComponent } from './nafi/nafi-instructions/nafi-instructions.component';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { DocumentDeActivateGuard } from '../shared/document-form/document-de-activate.guard';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { WbcComponent } from './wbc/wbc.component';
import { WbcInstructionsComponent } from './wbc/wbc-instructions/wbc-instructions.component';
import { WbcResultComponent } from './wbc/wbc-result/wbc-result.component';
import { WbcFormComponent } from './wbc/wbc-form/wbc-form.component';
import { WbcOwnSubmissionsComponent } from './wbc/wbc-own-submissions/wbc-own-submissions.component';

const routes: Routes = [
  {
    path: 'wbc',
    component: WbcComponent,
    children: [
      {path: '', pathMatch: 'full', component: WbcInstructionsComponent, data: { title: 'wbc.title' }},
      {path: 'stats', pathMatch: 'full', component: WbcResultComponent, data: { title: 'wbc.title' }},
      {path: 'form', pathMatch: 'full', component: WbcFormComponent, canActivate: [OnlyLoggedIn]},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: WbcFormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: WbcOwnSubmissionsComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: WbcInstructionsComponent, data: { title: 'wbc.title' } }
    ]
  },
  {
    path: 'nafi',
    component: NafiComponent,
    children: [
      {path: '', pathMatch: 'full', component: NafiInstructionsComponent, data: { title: 'nafi.stats.title' }},
      {path: 'stats', pathMatch: 'full', component: NafiResultComponent, data: { title: 'nafi.stats.title' }},
      {path: 'form', pathMatch: 'full', component: NafiFormComponent, canActivate: [OnlyLoggedIn]},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: NafiFormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: NafiMyDocumentListComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: NafiInstructionsComponent, data: { title: 'nafi.stats.title' } }
    ]
  },
  {path: 'herpetology',  pathMatch: 'full', component: HerpetologyComponent, data: {title: 'navigation.herpetology'}},
  {path: 'ykj',  pathMatch: 'full', component: YkjComponent, data: {title: 'navigation.ykj'}},
  {path: 'emk',  pathMatch: 'full', component: EmkComponent, data: {title: 'Eliömaakunnat'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ThemeRoutingModule { }
