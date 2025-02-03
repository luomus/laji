import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeoapiComponent } from './geoapi.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: GeoapiComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeoapiRoutingModule { }
