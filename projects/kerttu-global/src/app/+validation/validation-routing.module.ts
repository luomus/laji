import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidationComponent } from './validation.component';
import { OnlyLoggedIn } from '../../../../laji/src/app/shared/route/only-logged-in';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: ValidationComponent, canActivate: [OnlyLoggedIn]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidationRoutingModule { }
