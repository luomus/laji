import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './save-observations.routes';
import { SaveObservationsComponent } from './save-observations.component';
import { LajiUiModule } from '../../../projects/laji-ui/src/public-api';


@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule],
  declarations: [SaveObservationsComponent]
})
export class SaveObservationsModule {
}
