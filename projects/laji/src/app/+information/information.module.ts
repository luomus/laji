import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './information.routes';
import { InformationComponent } from './information.component';
import { InformationStore } from './information.store';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';

@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule],
  providers: [InformationStore],
  declarations: [InformationComponent],
})
export class InformationModule {
}
