import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiogeographicalProvinceComponent } from './biogeographical-province/biogeographical-province.component';

@NgModule({
  declarations: [BiogeographicalProvinceComponent],
  imports: [
    CommonModule
  ],
  exports: [BiogeographicalProvinceComponent]
})
export class BiogeographicalProvincesModule { }
