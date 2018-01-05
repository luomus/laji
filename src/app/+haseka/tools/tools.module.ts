import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MappingService } from './service/mapping.service';

import { ToolsRoutingModule } from './tools-routing.module';
import { ToolsComponent } from './tools.component';
import { ImporterComponent } from './importer/importer.component';
import { ExcelGeneratorComponent } from './excel-generator/excel-generator.component';
import { SharedModule } from '../../shared/shared.module';
import { FieldListComponent } from './excel-generator/field-list/field-list.component';
import { LevelFilterPipe } from './excel-generator/pipes/level-filter.pipe';
import { SpreadSheetService } from './service/spread-sheet.service';
import { FormSelectComponent } from './shared/form-select/form-select.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ToolsRoutingModule
  ],
  declarations: [
    ToolsComponent,
    ImporterComponent,
    ExcelGeneratorComponent,
    FieldListComponent,
    LevelFilterPipe,
    FormSelectComponent
  ],
  providers: [SpreadSheetService, MappingService]
})
export class ToolsModule { }
