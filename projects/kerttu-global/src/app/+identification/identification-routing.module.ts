import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlyLoggedIn } from '../../../../laji/src/app/shared/route/only-logged-in';
import { IdentificationInstructionsComponent } from './identification-instructions/identification-instructions.component';
import { ExpertiseComponent } from './expertise/expertise.component';
import { RecordingIdentificationComponent } from './recording-identification/recording-identification.component';
import { IdentificationResultsComponent } from './identification-results/identification-results.component';
import { IdentificationComponent } from './identification.component';
import { DocumentDeActivateGuard } from '../../../../laji/src/app/shared/guards/document-de-activate.guard';
import { IdentificationHistoryComponent } from './identification-history/identification-history.component';

const routes: Routes = [
  {
    path: '',
    component: IdentificationComponent,
    data: {title: 'Bird Sounds Global'},
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: IdentificationInstructionsComponent},
      {path: 'expertise', pathMatch: 'full', component: ExpertiseComponent, canActivate: [OnlyLoggedIn]},
      {path: 'recordings', pathMatch: 'full', component: RecordingIdentificationComponent, canActivate: [OnlyLoggedIn], canDeactivate: [DocumentDeActivateGuard]},
      {path: 'history', pathMatch: 'full', component: IdentificationHistoryComponent, canActivate: [OnlyLoggedIn]},
      {path: 'results', pathMatch: 'full', component: IdentificationResultsComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdentificationRoutingModule { }
