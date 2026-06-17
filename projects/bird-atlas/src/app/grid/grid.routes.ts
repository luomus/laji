import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { GridIndexComponent } from './grid-index/grid-index.component';
import { GridInfoComponent } from './grid-info/grid-info.component';
import { BreadcrumbId } from '../core/breadcrumb.service';

export const routes: Routes = [
  {
    path: '',
    component: GridIndexComponent,
    data: {
      breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.GridIndex ]
    }
  },
  {
    path: ':id',
    component: GridInfoComponent,
    data: {
      breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.GridIndex, BreadcrumbId.GridInfo ]
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
