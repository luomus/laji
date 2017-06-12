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

const routes: Routes = [
  {
    path: 'nafi',
    component: NafiComponent,
    children: [
      {path: '', pathMatch: 'full', component: NafiInstructionsComponent},
      {path: 'stats', pathMatch: 'full', component: NafiResultComponent},
      {path: 'form', pathMatch: 'full', component: NafiFormComponent, canActivate: [OnlyLoggedIn]},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: NafiFormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'myObservations', pathMatch: 'full', component: NafiMyDocumentListComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: NafiInstructionsComponent}
    ]
  },
  {path: 'herpetology',  pathMatch: 'full', component: HerpetologyComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ThemeRoutingModule { }
