import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolsRoutingModule } from './tools-routing.module';
import { ToolsComponent } from './tools.component';
import { ImporterComponent } from './importer/importer.component';
import { ExcelGeneratorComponent } from './excel-generator/excel-generator.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ToolsRoutingModule
  ],
  declarations: [ToolsComponent, ImporterComponent, ExcelGeneratorComponent]
})
export class ToolsModule { }
