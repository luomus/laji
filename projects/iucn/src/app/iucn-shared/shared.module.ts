import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IucnClassComponent } from './component/iucn-class/iucn-class.component';
import { SharedModule } from '../../../../../src/app/shared/shared.module';
import { IucnStatusPipe } from './pipe/iucn-status.pipe';
import { IucnHyphensPipe } from './pipe/iucn-hyphens.pipe';
import { SimpleOmniComponent } from './component/simple-omni/simple-omni.component';
import { TaxonSelectModule } from '../../../../../src/app/shared-modules/taxon-select/taxon-select.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    TaxonSelectModule
  ],
  declarations: [IucnClassComponent, IucnStatusPipe, IucnHyphensPipe, SimpleOmniComponent],
  exports: [IucnClassComponent, IucnStatusPipe, SimpleOmniComponent]
})
export class IucnSharedModule { }
