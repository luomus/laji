import { NgModule } from '@angular/core';
import { StatisticsModule } from './statistics/statistics.module';
import { routing } from './submissions.routes';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    routing,
    StatisticsModule,
    SharedModule
  ],
  declarations: [],
  exports: []
})
export class SubmissionsModule { }
