import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './ui-components.routes';
import { UiComponentsComponent } from './ui-components.component';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';


@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule],
  declarations: [UiComponentsComponent]
})
export class UiComponentsModule {
}
