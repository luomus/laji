import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CollectionsSelectComponent } from './collections-select.component';
import { TreeSelectModule } from '../tree-select/tree-select.module';

@NgModule({
  imports: [
    SharedModule,
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
