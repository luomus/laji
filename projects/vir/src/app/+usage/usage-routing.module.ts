import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsageComponent } from './usage.component';
import { UsageByCollectionComponent } from './pages/usage-by-collection/usage-by-collection.component';
import { UsageByOrganizationComponent } from './pages/usage-by-organization/usage-by-organization.component';
import { UsageByUserComponent } from './pages/usage-by-user/usage-by-user.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: UsageComponent
  },
  {
    path: 'by-organization',
    pathMatch: 'full',
    component: UsageByOrganizationComponent
  },
  {
    path: 'by-user',
    pathMatch: 'full',
    component: UsageByUserComponent
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
