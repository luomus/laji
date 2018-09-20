import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicationsComponent } from './publications.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: PublicationsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicationsRoutingModule { }
