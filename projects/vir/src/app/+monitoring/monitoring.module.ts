import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaveObservationsRoutingModule } from './monitoring-routing.module';
import { MonitoringComponent } from './monitoring.component';
import { TranslateModule } from '@ngx-translate/core';
import { MonitoringFacade } from './monitoring.facade';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { SurveyBoxModule } from '../../../../../src/app/shared-modules/survey-box/survey-box.module';


@NgModule({
  declarations: [MonitoringComponent],
  imports: [
    CommonModule,
    SaveObservationsRoutingModule,
    TranslateModule,
    SurveyBoxModule,
    LajiUiModule
  ],
  providers: [
    MonitoringFacade
  ]
})
export class MonitoringModule { }
