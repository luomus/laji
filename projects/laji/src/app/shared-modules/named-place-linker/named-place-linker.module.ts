import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NamedPlaceModule } from '../../+project-form/form/named-place/named-place.module';
import { NamedPlaceLinkerComponent } from './named-place-linker.component';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    NamedPlaceModule,
    LajiUiModule
  ],
  declarations: [NamedPlaceLinkerComponent],
  exports: [
    NamedPlaceLinkerComponent
  ]
})
export class NamedPlaceLinkerModule {}
