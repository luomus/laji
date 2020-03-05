import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImporterComponent } from './importer/importer.component';
import { ExcelGeneratorComponent } from './excel-generator/excel-generator.component';
import { FieldListComponent } from './excel-generator/field-list/field-list.component';
import { LevelFilterPipe } from './excel-generator/pipes/level-filter.pipe';
import { FormSelectComponent } from './shared/form-select/form-select.component';
import { ColMapperComponent } from './importer/col-mapper/col-mapper.component';
import { MappingSelectComponent } from './shared/mapping-select/mapping-select.component';
import { CellValueMappingComponent } from './importer/cell-value-mapping/cell-value-mapping.component';
import { CellValueSelectComponent } from './importer/cell-value-mapping/cell-value-select/cell-value-select.component';
import { SpecialGeometryComponent } from './importer/cell-value-mapping/special-geometry/special-geometry.component';
import { SpecialFriendComponent } from './importer/cell-value-mapping/special-friend/special-friend.component';
import { SpecialTaxonIdComponent } from './importer/cell-value-mapping/special-taxon-id/special-taxon-id.component';
import { SpecialNamedPlacesComponent } from './importer/cell-value-mapping/special-named-places/special-named-places.component';
import { StatusCellComponent } from './importer/status-cell/status-cell.component';
import { ErrorListComponent } from './importer/status-cell/error-list/error-list.component';
import { SpecialTaxonNameComponent } from './importer/cell-value-mapping/special-taxon-name/special-taxon-name.component';
import { ToolSuccessComponent } from './shared/tool-success/tool-success.component';
import { StepperComponent } from './shared/stepper/stepper.component';
import { TaxonAutocompleteModule } from '../taxon-autocomplete/taxon-autocomplete.module';
// tslint:disable-next-line:max-line-length
import { SpecialInformalTaxonGroupsComponent } from './importer/cell-value-mapping/special-informal-taxon-groups/special-informal-taxon-groups.component';
import { CanSplitToPipe } from './excel-generator/pipes/can-split-to.pipe';
import { SpreadsheetService } from './service/spreadsheet.service';
import { MappingService } from './service/mapping.service';
import { ImportService } from './service/import.service';
import { GeneratorService } from './service/generator.service';
import { AugmentService } from './service/augment.service';
import { SharedModule } from '../../shared/shared.module';
import { DatatableModule } from '../datatable/datatable.module';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { TypeaheadModule } from 'ngx-bootstrap';
import { UserMappingButtonComponent } from './importer/load-file/user-mapping-button.component';
import { SpreadsheetFacade } from './spreadsheet.facade';

@NgModule({
  declarations: [
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
    SpecialInformalTaxonGroupsComponent,
    CanSplitToPipe,
    UserMappingButtonComponent
  ],
    exports: [ImporterComponent, ExcelGeneratorComponent, StepperComponent],
  imports: [
    CommonModule,
    SharedModule,
    DatatableModule,
    LajiMapModule,
    TypeaheadModule,
    TaxonAutocompleteModule,
  ],
  providers: [SpreadsheetService, MappingService, ImportService, GeneratorService, AugmentService, SpreadsheetFacade],
})
export class SpreadsheetModule { }
