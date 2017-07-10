import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { GenericComponent } from './generic.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule],
  declarations: [GenericComponent, NotFoundComponent]
})
export class ErrorModule {
}
