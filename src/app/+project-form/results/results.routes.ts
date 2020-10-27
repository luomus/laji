import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResultsComponent } from './results.component';

export const routes: Routes = [
  {path: '', component: ResultsComponent, data: {noScrollToTop: true}}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
