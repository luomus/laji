import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { SimpleOmniComponent } from './component/simple-omni/simple-omni.component';
import { TaxonSelectModule } from '../../../../laji/src/app/shared-modules/taxon-select/taxon-select.module';
import {SelectComponent} from './component/select/select.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    TaxonSelectModule
  ],
  declarations: [SimpleOmniComponent, SelectComponent],
  exports: [SimpleOmniComponent, SelectComponent]
})
export class IucnSharedModule { }
