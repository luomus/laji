import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SaveObservationsComponent } from './save-observations/save-observations.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SaveObservationsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaveObservationsRoutingModule { }
