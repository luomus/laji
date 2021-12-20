import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { InfoModule } from '../info/info.module';
import { SelectCollectionsComponent } from './select-collections.component';
import { TreeModule } from '@circlon/angular-tree-component';
import { SelectModule } from '../select/select.module';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { SelectTreeModule } from '../select-tree/select-tree.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InfoModule,
    TreeModule,
    SelectModule,
    LajiUiModule,
    SelectTreeModule
  ],
  declarations: [
    SelectCollectionsComponent,
   ],
  exports: [
    SelectCollectionsComponent,
  ],
})
export class SelectCollectionsModule { }
