import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NamedPlaceComponent } from './named-place/named-place.component';
import { NpChooseComponent } from './np-choose/np-choose.component';
import { NpListComponent } from './np-choose/np-list/np-list.component';
import { NpMapComponent } from './np-choose/np-map/np-map.component';
import { NpEditComponent } from './np-edit/np-edit.component';
import { NpEditFormComponent } from './np-edit/np-edit-form/np-edit-form.component';
import { NpInfoComponent } from './np-edit/np-info/np-info.component';
import { NpInfoRowComponent } from './np-edit/np-info/np-info-row/np-info-row.component';
import { NpInfoMapComponent } from './np-edit/np-info/np-info-map/np-info-map.component';
import { NpPrintComponent } from './np-print/np-print.component';
import { LineTransectPrintComponent } from './np-print/line-transect-print/line-transect-print.component';
import { AreaSelectComponent } from './area-select/area-select.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { DatatableModule } from '../datatable/datatable.module';
import { OwnSubmissionsModule } from '../own-submissions/own-submissions.module';
import { LajiFormModule } from '@laji-form/laji-form.module';
import { TaxonAutocompleteModule } from '../taxon-autocomplete/taxon-autocomplete.module';
import { DocumentViewerModule } from '../document-viewer/document-viewer.module';
import { ClipboardModule } from 'ngx-clipboard';
import { LajiUiModule } from '../../../../projects/laji-ui/src/public-api';
import { InfoModule } from '../info/info.module';
import { FormPermissionModule } from '../../+haseka/form-permission/form-permission.module';
import { SelectModule } from '../select/select.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    DatatableModule,
    OwnSubmissionsModule,
    SelectModule,
    LajiFormModule,
    LajiMapModule,
    TaxonAutocompleteModule,
    FormPermissionModule,
    DocumentViewerModule,
    ClipboardModule,
    LajiUiModule,
    InfoModule
  ],
  declarations: [
    NamedPlaceComponent, NpListComponent, NpMapComponent, NpChooseComponent, NpEditComponent,
    NpEditFormComponent, NpInfoComponent, NpInfoRowComponent, NpInfoMapComponent, NpPrintComponent, LineTransectPrintComponent,
    AreaSelectComponent
  ],
  exports: [NamedPlaceComponent, NpPrintComponent, AreaSelectComponent]
})
export class NamedPlaceModule {}
