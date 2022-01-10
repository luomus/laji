import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { IucnExtendedGroupSelectComponent } from './iucn-extended-group-select.component';
import { ObservationExtendedGroupSelectComponent } from './observation-extended-group-select.component';
import { TreeSelectModule } from '../tree-select/tree-select.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LajiUiModule,
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
