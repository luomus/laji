import { StatisticsComponent } from './statistics/statistics.component';
import { SubmissionsComponent } from './submissions.component';
import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

export const routes: Routes = [
  {path: ':documentID', pathMatch: 'full', component: StatisticsComponent},
  {path: '', pathMatch: 'full', component: SubmissionsComponent}
]

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
