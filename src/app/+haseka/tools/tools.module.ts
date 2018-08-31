import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MappingService } from './service/mapping.service';
import { TypeaheadModule } from 'ngx-bootstrap';

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
import { MappingSelectComponent } from './shared/mapping-select/mapping-select.component';
import { CellValueMappingComponent } from './importer/cell-value-mapping/cell-value-mapping.component';
import { ImportService } from './service/import.service';
import { CellValueSelectComponent } from './importer/cell-value-mapping/cell-value-select/cell-value-select.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { SpecialGeometryComponent } from './importer/cell-value-mapping/special-geometry/special-geometry.component';
import { GeneratorService } from './service/generator.service';
import { SpecialFriendComponent } from './importer/cell-value-mapping/special-friend/special-friend.component';
import { SpecialTaxonIdComponent } from './importer/cell-value-mapping/special-taxon-id/special-taxon-id.component';
import { SpecialNamedPlacesComponent } from './importer/cell-value-mapping/special-named-places/special-named-places.component';
import { StatusCellComponent } from './importer/status-cell/status-cell.component';
import { ErrorListComponent } from './importer/status-cell/error-list/error-list.component';
import { AugmentService } from './service/augment.service';
import { SpecialTaxonNameComponent } from './importer/cell-value-mapping/special-taxon-name/special-taxon-name.component';
import { ToolSuccessComponent } from './shared/tool-success/tool-success.component';
import { StepperComponent } from './shared/stepper/stepper.component';
import { TaxonAutocompleteModule } from '../../shared-modules/taxon-autocomplete/taxon-autocomplete.module';
// tslint:disable-next-line:max-line-length
import { SpecialInformalTaxonGroupsComponent } from './importer/cell-value-mapping/special-informal-taxon-groups/special-informal-taxon-groups.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ToolsRoutingModule,
    DatatableModule,
    LajiMapModule,
    TypeaheadModule,
    TaxonAutocompleteModule
  ],
  declarations: [
    ToolsComponent,
    ImporterComponent,
    ExcelGeneratorComponent,
    FieldListComponent,
    LevelFilterPipe,
    FormSelectComponent,
    ColMapperComponent,
    MappingSelectComponent,
    CellValueMappingComponent,
    CellValueSelectComponent,
    SpecialGeometryComponent,
    SpecialFriendComponent,
    SpecialTaxonIdComponent,
    SpecialNamedPlacesComponent,
    StatusCellComponent,
    ErrorListComponent,
    SpecialTaxonNameComponent,
    ToolSuccessComponent,
    StepperComponent,
    SpecialInformalTaxonGroupsComponent
  ],
  providers: [SpreadSheetService, MappingService, ImportService, GeneratorService, AugmentService],
  exports: []
})
export class ToolsModule { }
