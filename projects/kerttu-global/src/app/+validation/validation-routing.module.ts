import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidationComponent } from './validation.component';
import { DocumentDeActivateGuard } from 'projects/laji/src/app/shared/guards/document-de-activate.guard';
import { SpeciesValidationComponent } from './species-validation/species-validation.component';
import { SpeciesListQueryResetGuard } from './service/species-list-query-reset.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [SpeciesListQueryResetGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ValidationComponent
      },
      {
        path: ':id',
        pathMatch: 'full',
        component: SpeciesValidationComponent,
        canDeactivate: [DocumentDeActivateGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidationRoutingModule { }
