import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NamedPlacesService } from './named-places.service';
import { NamedPlaceComponent } from './named-place/named-place.component';
import { NpChooseComponent} from './np-choose/np-choose.component';
import { NpListComponent } from './np-choose/np-list/np-list.component';
import { NpMapComponent } from './np-choose/np-map/np-map.component';
import { NpEditComponent } from './np-edit/np-edit.component';
import { NpEditFormComponent } from './np-edit/np-edit-form/np-edit-form.component';
import { NpInfoComponent } from './np-edit/np-info/np-info.component';
import { NpInfoRowComponent } from './np-edit/np-info/np-info-row/np-info-row.component';
import { NpAreaFormComponent } from './np-edit/np-edit-form/np-area-form/np-area-form.component';

@NgModule({
  providers: [NamedPlacesService],
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [NamedPlaceComponent, NpListComponent, NpMapComponent, NpChooseComponent, NpEditComponent, NpEditFormComponent, NpInfoComponent, NpInfoRowComponent, NpAreaFormComponent],
  exports: [NamedPlaceComponent]
})
export class NamedPlaceModule { }
