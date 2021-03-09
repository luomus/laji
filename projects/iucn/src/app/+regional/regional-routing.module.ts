import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegionalComponent } from './regional/regional.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: RegionalComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegionalRoutingModule { }
