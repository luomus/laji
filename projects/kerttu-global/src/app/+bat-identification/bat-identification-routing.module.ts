import { RouterModule, Routes } from '@angular/router';
import { OnlyLoggedIn } from '../../../../laji/src/app/shared/route/only-logged-in';
import { DocumentDeActivateGuard } from '../../../../laji/src/app/shared/guards/document-de-activate.guard';
import {
  IdentificationHistoryComponent
} from '../+identification/identification-history/identification-history.component';
import {
  IdentificationResultsComponent
} from '../+identification/identification-results/identification-results.component';
import { NgModule } from '@angular/core';
import { BatIdentificationComponent } from './bat-identification.component';
import {
  BatIdentificationInstructionsComponent
} from './bat-identification-instructions/bat-identification-instructions.component';
import {
  BatRecordingIdentificationComponent
} from './bat-recording-identification/bat-recording-identification.component';

const routes: Routes = [
  {
    path: '',
    component: BatIdentificationComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: BatIdentificationInstructionsComponent},
      {path: 'recordings', pathMatch: 'full', component: BatRecordingIdentificationComponent, canActivate: [OnlyLoggedIn], canDeactivate: [DocumentDeActivateGuard]},
      {path: 'history', pathMatch: 'full', component: IdentificationHistoryComponent, canActivate: [OnlyLoggedIn]},
      {path: 'results', pathMatch: 'full', component: IdentificationResultsComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BatIdentificationRoutingModule { }
