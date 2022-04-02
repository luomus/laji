import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TechnicalNewsComponent } from './technical-news.component';
import { SharedModule } from '../../shared/shared.module';
import { TechnicalNewsDumbComponent } from './technical-news-dumb.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [TechnicalNewsComponent, TechnicalNewsDumbComponent],
  exports: [TechnicalNewsComponent]
})
export class TechnicalNewsModule { }
