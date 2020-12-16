import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { InfoModule } from '../info/info.module';
import { SelectCollectionsComponent } from './select-collections.component';
import { TreeModule } from '@circlon/angular-tree-component';
import { SelectCollectionsModalComponent } from './select-collections-modal/select-collections-modal.component';
import { SelectModule } from '../select/select.module';
import { SelectedCollectionsComponent } from './selected-collections/selected-collections.component';
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
    SelectCollectionsComponent,
    SelectCollectionsModalComponent,
    SelectedCollectionsComponent,
    CountRoundingPipe,
   ],
  exports: [
    SelectCollectionsComponent,
  ],
})
export class SelectCollectionsModule { }
