import { RouterModule, Routes } from '@angular/router';
import { OnlyLoggedIn } from '../../../../laji/src/app/shared/route/only-logged-in';
import { DocumentDeActivateGuard } from '../../../../laji/src/app/shared/guards/document-de-activate.guard';
import { NgModule } from '@angular/core';
import { BatIdentificationComponent } from './bat-identification.component';
import {
  BatIdentificationInstructionsComponent
} from './bat-identification-instructions/bat-identification-instructions.component';
import {
  BatRecordingIdentificationComponent
} from './bat-recording-identification/bat-recording-identification.component';
import { BatIdentificationHistoryComponent } from './bat-identification-history/bat-identification-history.component';
import { BatIdentificationResultsComponent } from './bat-identification-results/bat-identification-results.component';

const routes: Routes = [
  {
    path: '',
    component: BatIdentificationComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: BatIdentificationInstructionsComponent},
      {path: 'recordings', pathMatch: 'full', component: BatRecordingIdentificationComponent, canActivate: [OnlyLoggedIn], canDeactivate: [DocumentDeActivateGuard]},
      {path: 'history', pathMatch: 'full', component: BatIdentificationHistoryComponent, canActivate: [OnlyLoggedIn]},
      {path: 'results', pathMatch: 'full', component: BatIdentificationResultsComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BatIdentificationRoutingModule { }
