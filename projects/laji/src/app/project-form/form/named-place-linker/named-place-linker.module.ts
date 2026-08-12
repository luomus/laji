import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { NamedPlaceModule } from '../named-place/named-place.module';
import { NamedPlaceLinkerComponent } from './named-place-linker.component';
import { NamedPlaceLinkerWrapperComponent } from './named-place-linker-wrapper.component';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    NamedPlaceModule,
  ],
  declarations: [NamedPlaceLinkerComponent, NamedPlaceLinkerWrapperComponent],
  exports: [
    NamedPlaceLinkerComponent,
    NamedPlaceLinkerWrapperComponent
  ]
})
export class NamedPlaceLinkerModule {}
