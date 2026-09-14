import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './save-observations.routes';
import { SaveObservationsComponent } from './save-observations.component';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { SaveObservationsFacade } from './save-observations.facade';
import { SurveyBoxModule } from '../shared-modules/survey-box/survey-box.module';
import { TechnicalNewsModule } from '../shared-modules/technical-news/technical-news.module';


@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule, SurveyBoxModule, TechnicalNewsModule],
  declarations: [SaveObservationsComponent],
  providers: [SaveObservationsFacade]
})
export class SaveObservationsModule {
}
