import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasetMetadataComponent } from '../../../../laji/src/app/shared-modules/dataset-metadata/dataset-metadata.component';
import { ThemeComponent } from './theme.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: ThemeComponent},
  {path: 'dataset-metadata', pathMatch: 'full', component: DatasetMetadataComponent, data: {title: 'theme.dataset-metadata'}},
  {path: 'dataset-metadata/:collectionId', pathMatch: 'full', component: DatasetMetadataComponent, data: {title: 'theme.dataset-metadata'}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThemeRoutingModule { }
