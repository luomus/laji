import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TraitDbBrowseComponent } from './trait-db-browse/trait-db-browse.component';
import { TraitDbDatasetComponent } from './trait-db-datasets/trait-db-dataset/trait-db-dataset.component';
import { TraitDbDatasetsComponent } from './trait-db-datasets/trait-db-datasets.component';
import { TraitDbNewDatasetComponent } from './trait-db-datasets/trait-db-new-dataset/trait-db-new-dataset.component';
import { TraitDbMainComponent } from './trait-db-main/trait-db-main.component';
import { TraitDbComponent } from './trait-db.component';

export const routes: Routes = [
  {
    path: '',
    component: TraitDbComponent,
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main', component: TraitDbMainComponent },
      { path: 'browse', component: TraitDbBrowseComponent },
      { path: 'datasets', children: [
        { path: '', pathMatch: 'full', component: TraitDbDatasetsComponent },
        { path: 'new', component: TraitDbNewDatasetComponent },
        { path: ':id', component: TraitDbDatasetComponent }
      ] }
    ]
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

