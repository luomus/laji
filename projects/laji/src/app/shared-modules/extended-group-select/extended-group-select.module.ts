import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ObservationExtendedGroupSelectComponent } from './observation-extended-group-select.component';
import { TreeSelectModule } from '../tree-select/tree-select.module';

@NgModule({
  imports: [
    SharedModule,
    TreeSelectModule
  ],
  providers: [ ],
  declarations: [
    ObservationExtendedGroupSelectComponent,
   ],
  exports: [
    ObservationExtendedGroupSelectComponent,
  ],
})
export class ExtendedGroupSelectModule { }
