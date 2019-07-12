import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiBarComponent } from './ng2-charts-bar-vertical-group/ng2-charts-bar-vertical-group.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule
  ],
  declarations: [LajiBarComponent],
  exports: [LajiBarComponent]
})
export class ChartsModuleBarVerticalGroup { }


