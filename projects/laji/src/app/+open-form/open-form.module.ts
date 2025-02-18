import { NgModule } from '@angular/core';
import { routing } from './open-form.routes';
import { OpenFormComponent } from './open-form/open-form.component';

@NgModule({
  imports: [
    routing
  ],
  declarations: [
    OpenFormComponent
  ]
})
export class OpenFormModule {
}
