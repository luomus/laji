import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { TitleMetaPageService } from './title-meta-page.service';


@NgModule({
  imports: [routing, SharedModule, RouterModule],
  providers: [TitleMetaPageService],
  declarations: [NewsComponent]
})
export class NewsModule {
}
