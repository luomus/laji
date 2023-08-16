import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoPageComponent } from './info-page.component';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { UtilitiesModule } from '../utilities/utilities.module';
import { SharedModule } from '../../shared/shared.module';
import { InfoPageLoadingComponent } from './info-page-loading.component';

@NgModule({
  declarations: [InfoPageComponent, InfoPageLoadingComponent],
  imports: [
    CommonModule,
    LajiUiModule,
    UtilitiesModule,
    SharedModule
  ],
  exports: [InfoPageComponent, InfoPageLoadingComponent]
})
export class InfoPageModule { }
