import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { InfoModule } from '../info/info.module';
import { TreeModule } from '@circlon/angular-tree-component';
import { SelectTreeComponent } from './select-tree.component';
import { SelectTreeModalComponent } from './select-tree-modal/select-tree-modal.component';
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
    SelectTreeComponent,
    SelectTreeModalComponent,
    SelectedTreeNodesComponent,
    CountRoundingPipe,
   ],
  exports: [
    SelectTreeComponent,
    SelectTreeModalComponent,
    SelectedTreeNodesComponent,
    CountRoundingPipe,
  ],
})
export class SelectTreeModule { }
