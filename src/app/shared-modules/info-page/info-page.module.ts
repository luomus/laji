import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoPageComponent } from './info-page.component';
import { LajiUiModule } from '../../../../projects/laji-ui/src/public-api';

@NgModule({
  declarations: [InfoPageComponent],
  imports: [
    CommonModule,
    LajiUiModule
  ],
  exports: [InfoPageComponent]
})
export class InfoPageModule { }
