import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NamedPlaceComponent } from './named-place/named-place.component';
import { NpListComponent } from './np-list/np-list.component';
import { SharedModule } from '../../shared/shared.module';
import { NamedPlacesService } from './named-places.service';
import {NpMapComponent} from "./np-map/np-map.component";

@NgModule({
  providers: [NamedPlacesService],
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [NamedPlaceComponent, NpListComponent, NpMapComponent],
  exports: [NamedPlaceComponent]
})
export class NamedPlaceModule { }
