import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TechnicalNewsComponent } from './technical-news.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [TechnicalNewsComponent],
  exports: [TechnicalNewsComponent]
})
export class TechnicalNewsModule { }
