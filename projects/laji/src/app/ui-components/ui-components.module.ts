import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './ui-components.routes';
import { UiComponentsComponent } from './ui-components.component';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import {ProgressbarModule} from 'projects/laji-ui/src/lib/progressbar/progressbar.module';


@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule, ProgressbarModule],
  declarations: [UiComponentsComponent]
})
export class UiComponentsModule {
}
