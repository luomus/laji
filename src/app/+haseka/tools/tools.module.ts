import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MappingService } from './service/mapping.service';

import { DatatableModule } from '../../shared-modules/datatable/datatable.module';
import { ToolsRoutingModule } from './tools-routing.module';
import { ToolsComponent } from './tools.component';
import { ImporterComponent } from './importer/importer.component';
import { ExcelGeneratorComponent } from './excel-generator/excel-generator.component';
import { SharedModule } from '../../shared/shared.module';
import { FieldListComponent } from './excel-generator/field-list/field-list.component';
import { LevelFilterPipe } from './excel-generator/pipes/level-filter.pipe';
import { SpreadSheetService } from './service/spread-sheet.service';
import { FormSelectComponent } from './shared/form-select/form-select.component';
import { ColMapperComponent } from './importer/col-mapper/col-mapper.component';
import { HeaderSelectComponent } from './importer/col-mapper/header-select/header-select.component';
import { CellValueMappingComponent } from './importer/cell-value-mapping/cell-value-mapping.component';
import { ImportService } from './service/import.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ToolsRoutingModule,
    DatatableModule
  ],
  declarations: [
    ToolsComponent,
    ImporterComponent,
    ExcelGeneratorComponent,
    FieldListComponent,
    LevelFilterPipe,
    FormSelectComponent,
    ColMapperComponent,
    HeaderSelectComponent,
    CellValueMappingComponent
  ],
  providers: [SpreadSheetService, MappingService, ImportService]
})
export class ToolsModule { }
