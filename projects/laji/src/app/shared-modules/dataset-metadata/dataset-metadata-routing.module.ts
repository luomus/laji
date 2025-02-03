 import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatasetMetadataComponent } from './dataset-metadata.component';

const routes: Routes = [
  {path: '', component: DatasetMetadataComponent, data: {title: 'theme.dataset-metadata'}},
  {path: ':collectionId', component: DatasetMetadataComponent, data: {title: 'theme.dataset-metadata'}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class DatasetMetadataRoutingModule { }
