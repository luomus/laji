import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyBoxComponent } from './survey-box.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [SurveyBoxComponent],
  exports: [SurveyBoxComponent]
})
export class SurveyBoxModule { }
