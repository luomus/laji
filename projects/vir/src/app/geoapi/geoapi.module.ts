import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { GeoapiComponent } from './geoapi.component';
import { GeoapiRoutingModule } from './geoapi-routing.module';
import { DownloadModalModule } from '../../../../laji/src/app/shared-modules/download-modal/download-modal.module';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';


@NgModule({
  declarations: [GeoapiComponent],
  imports: [
    CommonModule,
    GeoapiRoutingModule,
    TranslateModule,
    SharedModule,
    DownloadModalModule,
    InfoPageModule
  ]
})
export class GeoapiModule { }
