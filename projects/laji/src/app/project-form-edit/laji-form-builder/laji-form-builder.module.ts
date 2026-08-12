import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LajiFormBuilderComponent } from './laji-form-builder.component';

@NgModule({
  imports: [SharedModule],
  declarations: [LajiFormBuilderComponent],
  exports: [LajiFormBuilderComponent]
})
export class LajiFormBuilderModule { }
