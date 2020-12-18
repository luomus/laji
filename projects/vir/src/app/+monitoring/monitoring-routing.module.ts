import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonitoringComponent } from './monitoring.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MonitoringComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaveObservationsRoutingModule { }
