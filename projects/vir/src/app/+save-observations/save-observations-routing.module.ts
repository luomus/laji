import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SaveObservationsComponent } from './save-observations.component';


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
