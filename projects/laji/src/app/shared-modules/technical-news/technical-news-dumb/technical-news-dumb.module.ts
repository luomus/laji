import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TechnicalNewsDumbComponent } from './technical-news-dumb.component';
import { RouterModule } from '@angular/router';
import { UtilitiesDumbDirectivesModule } from '../../utilities/directive/dumb-directives/utilities-dumb-directives.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    UtilitiesDumbDirectivesModule
  ],
  declarations: [TechnicalNewsDumbComponent],
  exports: [TechnicalNewsDumbComponent]
})
export class TechnicalNewsDumbModule { }
