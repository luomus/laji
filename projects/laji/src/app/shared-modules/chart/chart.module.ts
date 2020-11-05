import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart.component';
import { ChartsModule } from 'ng2-charts';
import { UtilitiesModule } from '../utilities/utilities.module';



@NgModule({
  declarations: [ChartComponent],
  imports: [
    CommonModule,
    ChartsModule,
    UtilitiesModule,
  ],
  exports: [ChartComponent]
})
export class ChartModule { }
