import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { InfoModule } from '../info/info.module';
import { CollectionsSelectComponent } from './collections-select.component';
import { TreeModule } from '@circlon/angular-tree-component';
import { SelectModule } from '../select/select.module';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { TreeSelectModule } from '../tree-select/tree-select.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InfoModule,
    TreeModule,
    SelectModule,
    LajiUiModule,
    TreeSelectModule
  ],
  declarations: [
    CollectionsSelectComponent,
   ],
  exports: [
    CollectionsSelectComponent,
  ],
})
export class CollectionsSelectModule { }
