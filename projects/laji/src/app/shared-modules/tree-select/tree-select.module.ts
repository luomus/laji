import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { InfoModule } from '../info/info.module';
import { TreeModule } from '@circlon/angular-tree-component';
import { TreeSelectComponent } from './tree-select.component';
import { TreeSelectModalComponent } from './tree-select-modal/tree-select-modal.component';
import { SelectModule } from '../select/select.module';
import { SelectedTreeNodesComponent } from './selected-tree-nodes/selected-tree-nodes.component';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { CountRoundingPipe } from './pipe/count-rounding.pipe';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InfoModule,
    TreeModule,
    SelectModule,
    LajiUiModule,
  ],
  declarations: [
    TreeSelectComponent,
    TreeSelectModalComponent,
    SelectedTreeNodesComponent,
    CountRoundingPipe,
   ],
  exports: [
    TreeSelectComponent,
    TreeSelectModalComponent,
    SelectedTreeNodesComponent,
    CountRoundingPipe,
  ],
})
export class TreeSelectModule { }
