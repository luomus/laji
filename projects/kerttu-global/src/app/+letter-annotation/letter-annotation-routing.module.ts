import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeciesListComponent } from './species-list/species-list.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: SpeciesListComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LetterAnnotationRoutingModule { }
