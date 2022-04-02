import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TechnicalNewsDumbComponent } from './technical-news-dumb.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  declarations: [TechnicalNewsDumbComponent],
  exports: [TechnicalNewsDumbComponent]
})
export class TechnicalNewsDumbModule { }
