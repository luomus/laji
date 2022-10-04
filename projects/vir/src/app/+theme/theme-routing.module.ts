import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThemeComponent } from './theme.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: ThemeComponent},
  {
    path: 'dataset-metadata',
    loadChildren: () => import('../../../../laji/src/app/shared-modules/dataset-metadata/dataset-metadata.module').then(m => m.DatasetMetadataModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThemeRoutingModule { }
