import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicalNewsComponent } from './technical-news.component';
import { SharedModule } from '../../shared/shared.module';
import { TechnicalNewsDumbModule } from './technical-news-dumb/technical-news-dumb.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TechnicalNewsDumbModule
  ],
  declarations: [TechnicalNewsComponent],
  exports: [TechnicalNewsComponent]
})
export class TechnicalNewsModule { }
