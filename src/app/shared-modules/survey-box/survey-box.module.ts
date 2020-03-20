import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyBoxComponent } from './survey-box.component';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

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
