import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { GenericComponent } from './generic.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule],
  declarations: [GenericComponent]
})
export class ErrorModule {
}
