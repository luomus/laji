import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsageComponent } from './usage.component';
import { UsageByPersonComponent } from './pages/usage-by-person/usage-by-person.component';
import { UsageByCollectionComponent } from './pages/usage-by-collection/usage-by-collection.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: UsageComponent
  },
  {
    path: 'by-person',
    pathMatch: 'full',
    component: UsageByPersonComponent
  },
  {
    path: 'by-collection',
    pathMatch: 'full',
    component: UsageByCollectionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsageRoutingModule { }
