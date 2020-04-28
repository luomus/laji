import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsageComponent } from './usage.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: UsageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsageRoutingModule { }
