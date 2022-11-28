import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentDeActivateGuard } from 'projects/laji/src/app/shared/guards/document-de-activate.guard';
import { SpeciesValidationComponent } from './species-validation/species-validation.component';
import { SpeciesListQueryResetGuard } from './service/species-list-query-reset.guard';
import { SpeciesSelectComponent } from './species-select/species-select.component';
import { ResultsComponent } from './results/results.component';
import { ValidationComponent } from './validation.component';
import { ValidationInstructionsComponent } from './validation-instructions/validation-instructions.component';
import { OnlyLoggedIn } from '../../../../laji/src/app/shared/route/only-logged-in';

const routes: Routes = [
  {
    path: '',
    component: ValidationComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'instructions'
      },
      {
        path: 'instructions',
        pathMatch: 'full',
        component: ValidationInstructionsComponent
      },
      {
        path: 'species',
        canActivate: [OnlyLoggedIn, SpeciesListQueryResetGuard],
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: SpeciesSelectComponent
          },
          {
            path: ':id',
            pathMatch: 'full',
            component: SpeciesValidationComponent,
            canDeactivate: [DocumentDeActivateGuard]
          }
        ]
      },
      {
        path: 'results',
        pathMatch: 'full',
        component: ResultsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidationRoutingModule { }
