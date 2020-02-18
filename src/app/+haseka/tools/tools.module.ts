import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolsRoutingModule } from './tools-routing.module';
import { ToolsComponent } from './tools.component';
import { SharedModule } from '../../shared/shared.module';
import { LabelDesignerComponent } from './label-designer/label-designer.component';
import { LabelDesignerModule } from 'label-designer';
import { SpreadsheetModule } from '../../shared-modules/spreadsheet/spreadsheet.module';
import { SheetGeneratorComponent } from './sheet-generator/sheet-generator.component';
import { SheetImporterComponent } from './sheet-importer/sheet-importer.component';

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
    SheetGeneratorComponent,
    SheetImporterComponent
  ],
  exports: []
})
export class ToolsModule { }
