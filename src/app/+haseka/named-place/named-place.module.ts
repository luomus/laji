import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NamedPlaceComponent } from './named-place/named-place.component';
import { NpListComponent } from './np-list/np-list.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NamedPlaceComponent, NpListComponent]
})
export class NamedPlaceModule { }
