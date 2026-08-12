import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontComponent } from './front/front.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: FrontComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class MapRoutingModule { }
