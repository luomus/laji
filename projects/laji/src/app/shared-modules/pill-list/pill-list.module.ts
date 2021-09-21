import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PillListComponent } from './pill-list.component';
import { SharedModule } from '../../shared/shared.module';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LajiUiModule
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
