import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PillListComponent } from './pill-list.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    PillListComponent
  ],
  providers: [],
  exports: [
    PillListComponent
  ]
})
export class PillListModule { }
