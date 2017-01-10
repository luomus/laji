import { NgModule } from '@angular/core';
import { InvasiveComponent } from './invasive.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './invasive.routes';

@NgModule({
  imports: [
    routing, SharedModule, RouterModule
  ],
  declarations: [InvasiveComponent, InvasiveComponent]
})
export class InvasiveModule { }
