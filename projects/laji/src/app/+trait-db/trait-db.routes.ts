import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TraitDbAboutComponent } from './trait-db-about/trait-db-about.component';
import { TraitDbBrowseComponent } from './trait-db-browse/trait-db-browse.component';
import { TraitDbDatasetComponent } from './trait-db-datasets/trait-db-dataset/trait-db-dataset.component';
import { TraitDbDatasetsComponent } from './trait-db-datasets/trait-db-datasets.component';
import { TraitDbDatasetEditorComponent } from './trait-db-datasets/trait-db-dataset-editor/trait-db-dataset-editor.component';
import { TraitDbMainComponent } from './trait-db-main/trait-db-main.component';
import { TraitDbTraitComponent } from './trait-db-traits/trait-db-trait/trait-db-trait.component';
import { TraitDbTraitsComponent } from './trait-db-traits/trait-db-traits.component';
import { TraitDbComponent } from './trait-db.component';
import { TraitDbTraitEditorComponent } from './trait-db-traits/trait-db-trait-editor/trait-db-trait-editor.component';
import { TraitDbTraitGroupEditorComponent } from './trait-db-traits/trait-db-trait-group-editor/trait-db-trait-group-editor.component';
import { TraitDbDataEntryComponent } from './trait-db-datasets/data-entry/trait-db-data-entry.component';
import { TraitDbDataEditorComponent } from './trait-db-datasets/data-editor/trait-db-data-editor.component';

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
        { path: 'new', component: TraitDbDatasetEditorComponent },
        { path: ':id/edit', component: TraitDbDatasetEditorComponent },
        { path: ':id', component: TraitDbDatasetComponent },
        { path: ':id/data-entry', component: TraitDbDataEntryComponent },
        { path: ':id/data-editor', component: TraitDbDataEditorComponent }
      ] },
      { path: 'traits', children: [
        { path: '', pathMatch: 'full', component: TraitDbTraitsComponent },
        { path: 'new', component: TraitDbTraitEditorComponent },
        { path: ':id/edit', component: TraitDbTraitEditorComponent },
        { path: ':id', component: TraitDbTraitComponent }
      ] },
      { path: 'trait-groups/new', component: TraitDbTraitGroupEditorComponent },
      { path: 'about', component: TraitDbAboutComponent },
    ]
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

