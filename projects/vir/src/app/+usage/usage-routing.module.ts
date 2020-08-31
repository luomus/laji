import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsageComponent } from './usage.component';
import { UsageDownloadsComponent } from './pages/usage-downloads/usage-downloads.component';
import { UsageByOrganizationComponent } from './pages/usage-by-organization/usage-by-organization.component';
import { UsageMyDownloadsComponent } from './pages/usage-my-downloads/usage-my-downloads.component';


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
    path: 'my-downloads',
    pathMatch: 'full',
    component: UsageMyDownloadsComponent
  },
  {
    path: 'downloads',
    pathMatch: 'full',
    component: UsageDownloadsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsageRoutingModule { }
