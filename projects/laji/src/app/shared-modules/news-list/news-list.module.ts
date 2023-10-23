import { NgModule } from '@angular/core';
import { NewsListComponent } from './news-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [ TranslateModule, SharedModule ],
  declarations: [ NewsListComponent ],
  exports: [ NewsListComponent ]
})
export class NewsListModule {}
