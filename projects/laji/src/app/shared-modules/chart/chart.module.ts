import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart.component';
import { BaseChartDirective } from 'ng2-charts';
import { UtilitiesModule } from '../utilities/utilities.module';
import { UtilitiesDumbDirectivesModule } from '../utilities/directive/dumb-directives/utilities-dumb-directives.module';



@NgModule({
  declarations: [ChartComponent],
  imports: [
    CommonModule,
    BaseChartDirective,
    UtilitiesModule,
    UtilitiesDumbDirectivesModule
  ],
  exports: [ChartComponent]
})
export class ChartModule { }
