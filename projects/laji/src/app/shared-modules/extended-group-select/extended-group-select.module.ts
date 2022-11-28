import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { IucnExtendedGroupSelectComponent } from './iucn-extended-group-select.component';
import { ObservationExtendedGroupSelectComponent } from './observation-extended-group-select.component';
import { TreeSelectModule } from '../tree-select/tree-select.module';

@NgModule({
  imports: [
    SharedModule,
    TreeSelectModule
  ],
  providers: [ ],
  declarations: [
    IucnExtendedGroupSelectComponent,
    ObservationExtendedGroupSelectComponent,
   ],
  exports: [
    IucnExtendedGroupSelectComponent,
    ObservationExtendedGroupSelectComponent,
  ],
})
export class ExtendedGroupSelectModule { }
