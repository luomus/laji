import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { SimpleOmniComponent } from './component/simple-omni/simple-omni.component';
import { TaxonSelectModule } from '../../../../laji/src/app/shared-modules/taxon-select/taxon-select.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    TaxonSelectModule
  ],
  declarations: [SimpleOmniComponent],
  exports: [SimpleOmniComponent]
})
export class IucnSharedModule { }
