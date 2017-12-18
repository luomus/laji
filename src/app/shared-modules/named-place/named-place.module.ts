import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NamedPlacesService } from './named-places.service';
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
import { LineTransectComponent } from './np-print/line-transect/line-transect.component';
import { AreaSelectComponent } from './area-select/area-select.component';
import { LajiMapModule } from '../map/laji-map.module';
import { DatatableModule } from '../datatable/datatable.module';
import { OwnSubmissionsModule } from '../own-submissions/own-submissions.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    LajiMapModule,
    DatatableModule,
    OwnSubmissionsModule
  ],
  declarations: [
    NamedPlaceComponent, NpListComponent, NpMapComponent, NpChooseComponent, NpEditComponent,
    NpEditFormComponent, NpInfoComponent, NpInfoRowComponent, NpInfoMapComponent, NpPrintComponent, LineTransectComponent,
    AreaSelectComponent
  ],
  exports: [NamedPlaceComponent, NpPrintComponent]
})
export class NamedPlaceModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        NamedPlacesService
      ]
    };
  }
}
