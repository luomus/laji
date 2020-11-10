import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenseComponent } from './license.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [LicenseComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [LicenseComponent]
})
export class LicenseModule { }
