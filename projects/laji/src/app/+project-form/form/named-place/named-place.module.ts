import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { NamedPlaceComponent } from './named-place/named-place.component';
import { NpChooseComponent } from './np-choose/np-choose.component';
import { NpListComponent } from './np-choose/np-list/np-list.component';
import { NpMapComponent } from './np-choose/np-map/np-map.component';
import { NpInfoComponent } from './np-info/np-info.component';
import { NpInfoRowComponent } from './np-info/np-info-row/np-info-row.component';
import { NpInfoMapComponent } from './np-info/np-info-map/np-info-map.component';
import { NpPrintComponent } from './np-print/np-print.component';
import { LineTransectPrintComponent } from './np-print/line-transect-print/line-transect-print.component';
import { AreaSelectComponent } from './area-select/area-select.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { ClipboardModule } from 'ngx-clipboard';
import { LajiUiModule } from '../../../../../../laji-ui/src/public-api';
import { TaxonAutocompleteModule } from '../../../shared-modules/taxon-autocomplete/taxon-autocomplete.module';
import { OwnSubmissionsModule } from '../../../shared-modules/own-submissions/own-submissions.module';
import { DocumentViewerModule } from '../../../shared-modules/document-viewer/document-viewer.module';
import { DatatableModule } from '../../../shared-modules/datatable/datatable.module';
import { SelectModule } from '../../../shared-modules/select/select.module';
import { InfoModule } from '../../../shared-modules/info/info.module';
import { FormPermissionModule } from '../../form-permission/form-permission.module';
import { DocumentFormHeaderModule } from '../../../shared-modules/laji-form/document-form-header/document-form-header.module';
import { NamedPlaceWrapperComponent } from './named-place-wrapper/named-place-wrapper.component';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    DatatableModule,
    OwnSubmissionsModule,
    SelectModule,
    LajiMapModule,
    TaxonAutocompleteModule,
    FormPermissionModule,
    DocumentViewerModule,
    ClipboardModule,
    LajiUiModule,
    InfoModule,
    DocumentFormHeaderModule
  ],
  declarations: [
    NamedPlaceComponent, NpListComponent, NpMapComponent, NpChooseComponent,
    NpInfoComponent, NpInfoRowComponent, NpInfoMapComponent, NpPrintComponent, LineTransectPrintComponent,
    AreaSelectComponent, NamedPlaceWrapperComponent
  ],
  exports: [NamedPlaceComponent, NpPrintComponent, AreaSelectComponent, NpChooseComponent]
})
export class NamedPlaceModule {}
