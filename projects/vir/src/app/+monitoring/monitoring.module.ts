import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaveObservationsRoutingModule } from './monitoring-routing.module';
import { MonitoringComponent } from './monitoring.component';
import { SurveyBoxModule } from 'app/shared-modules/survey-box/survey-box.module';
import { TranslateModule } from '@ngx-translate/core';
import { HasekaModule } from 'app/+haseka/haseka.module';
import { MonitoringFacade } from './monitoring.facade';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';


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
