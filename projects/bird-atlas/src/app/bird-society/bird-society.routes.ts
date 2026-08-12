import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { BreadcrumbId } from '../core/breadcrumb.service';
import { BirdSocietyIndexComponent } from './bird-society-index/bird-society-index.component';
import { BirdSocietyInfoComponent } from './bird-society-info/bird-society-info.component';
import { LappiSocietyComponent } from './lappi/lappi.component';

export const routes: Routes = [
  {
    path: '',
    component: BirdSocietyIndexComponent,
    data: {
      breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.BirdSocietyIndex ]
    }
  },
  {
    path: 'lappi',
    component: LappiSocietyComponent,
    data: {
      breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.BirdSocietyIndex, BreadcrumbId.Lappi ]
    }
  },
  {
    path: ':id',
    component: BirdSocietyInfoComponent,
    data: {
      breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.BirdSocietyIndex, BreadcrumbId.BirdSocietyInfo ]
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
