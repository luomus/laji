import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsageComponent } from './usage.component';
import { UsageDownloadsComponent } from './pages/usage-downloads/usage-downloads.component';
import { UsageByOrganizationComponent } from './pages/usage-by-organization/usage-by-organization.component';
import { UsageMyDownloadsComponent } from './pages/usage-my-downloads/usage-my-downloads.component';
import { UsageAdminComponent } from './pages/usage-admin/usage-admin.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: UsageComponent
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
  },
  {
    path: 'by-organization',
    pathMatch: 'full',
    component: UsageByOrganizationComponent
  },
  {
    path: 'admin',
    pathMatch: 'full',
    component: UsageAdminComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsageRoutingModule { }
