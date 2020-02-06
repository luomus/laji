import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolsRoutingModule } from './tools-routing.module';
import { ToolsComponent } from './tools.component';
import { SharedModule } from '../../shared/shared.module';
import { LabelDesignerComponent } from './label-designer/label-designer.component';
import { ImportContainerComponent } from './importer/import-container.component';
import { CanSplitToPipe } from './excel-generator/pipes/can-split-to.pipe';
import { LabelDesignerModule } from 'label-designer';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ToolsRoutingModule,
    LabelDesignerModule,
    SpreadsheetModule
  ],
  declarations: [
    ToolsComponent,
    LabelDesignerComponent,
    CanSplitToPipe
  ],
  exports: []
})
export class ToolsModule { }
