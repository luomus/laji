import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './save-observations.routes';
import { SaveObservationsComponent } from './save-observations.component';
import { LajiUiModule } from '../../../projects/laji-ui/src/public-api';
import { SurveyBoxModule } from 'app/shared-modules/survey-box/survey-box.module';
import { SaveObservationsFacade } from './save-observations.facade';


@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule, SurveyBoxModule],
  declarations: [SaveObservationsComponent],
  providers: [SaveObservationsFacade]
})
export class SaveObservationsModule {
}
