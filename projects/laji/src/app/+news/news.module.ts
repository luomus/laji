import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';



@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule],
  declarations: [NewsComponent]
})
export class NewsModule {
}
