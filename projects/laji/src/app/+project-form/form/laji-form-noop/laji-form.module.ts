import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { LajiFormComponent } from './laji-form/laji-form.component';
import { LajiFormFooterComponent } from './laji-form-footer/laji-form-footer.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
  ],
  declarations: [LajiFormComponent, LajiFormFooterComponent],
  exports: [LajiFormComponent, LajiFormFooterComponent]
})
export class LajiFormModule { }
