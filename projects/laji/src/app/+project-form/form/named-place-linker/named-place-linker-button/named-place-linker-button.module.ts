import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { NamedPlaceLinkerButtonComponent } from './named-place-linker-button.component';
import { LajiUiModule } from '../../../../../../../laji-ui/src/lib/laji-ui.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    LajiUiModule
  ],
  declarations: [NamedPlaceLinkerButtonComponent],
  exports: [
    NamedPlaceLinkerButtonComponent
  ]
})
export class NamedPlaceLinkerButtonModule {}
