import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { NewsListModule } from '../shared-modules/news-list/news-list.module';



@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule, NewsListModule],
  declarations: [NewsComponent]
})
export class NewsModule {
}
