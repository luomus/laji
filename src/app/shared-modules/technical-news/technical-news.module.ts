import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { TechnicalNewsComponent } from './technical-news.component';

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
