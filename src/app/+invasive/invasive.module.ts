import { NgModule, ViewChild } from '@angular/core';
import { InvasiveComponent } from './invasive.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './invasive.routes';
import { ViewerModule } from '../+viewer/viewer.module';

@NgModule({
  imports: [
    routing, SharedModule, RouterModule, ViewerModule
  ],
  declarations: [InvasiveComponent, InvasiveComponent]
})
export class InvasiveModule { }
