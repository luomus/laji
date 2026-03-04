import { RouterModule, Routes } from '@angular/router';
import { OnlyLoggedIn } from '../../../../laji/src/app/shared/route/only-logged-in';
import { DocumentDeActivateGuard } from '../../../../laji/src/app/shared/guards/document-de-activate.guard';
import { NgModule } from '@angular/core';
import { XenoCantoIdentificationComponent } from './xeno-canto-identification.component';
import {
  XenoCantoRecordingIdentificationComponent
} from './xeno-canto-recording-identification/xeno-canto-recording-identification.component';

const routes: Routes = [
  {
    path: '',
    component: XenoCantoIdentificationComponent,
    children: [
      {
        path: ':id', pathMatch: 'full',
        component: XenoCantoRecordingIdentificationComponent, canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class XenoCantoIdentificationRoutingModule { }
