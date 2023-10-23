import { NgModule } from '@angular/core';
import { SpinnerModule } from '../spinner/spinner.module';
import { SharedModule } from '../../shared/shared.module';
import { ObservationCountComponent } from './observation-count.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [ SpinnerModule, CommonModule, SharedModule ],
  declarations: [ ObservationCountComponent ],
  exports: [ ObservationCountComponent ]
})
export class ObservationCountModule {}
