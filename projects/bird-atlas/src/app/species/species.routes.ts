import { RouterModule, Routes } from '@angular/router';
import { SpeciesIndexComponent } from './species-index/species-index.component';
import { ModuleWithProviders } from '@angular/core';
import { SpeciesInfoComponent } from './species-info/species-info.component';
import { SpeciesComponent } from './species.component';
import { BreadcrumbId } from '../core/breadcrumb.service';

export const routes: Routes = [
  {
    path: '',
    component: SpeciesComponent,
    children: [
      {
        path: '',
        component: SpeciesIndexComponent,
        data: {
          breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.SpeciesIndex ]
        }
      },
      {
        path: ':id',
        component: SpeciesInfoComponent,
        data: {
          breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.SpeciesIndex, BreadcrumbId.SpeciesInfo ]
        }
      }
    ]
  },
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
