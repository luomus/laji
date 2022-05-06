import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { BreadcrumbId } from '../core/breadcrumb.service';
import { AssociationIndexComponent } from './association-index/association-index.component';
import { AssociationInfoComponent } from './association-info/association-info.component';

export const routes: Routes = [
  {
    path: '',
    component: AssociationIndexComponent,
    data: {
      breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.AssociationIndex ]
    }
  },
  {
    path: ':id',
    component: AssociationInfoComponent,
    data: {
      breadcrumbStack: [ BreadcrumbId.Home, BreadcrumbId.AssociationIndex, BreadcrumbId.AssociationInfo ]
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
