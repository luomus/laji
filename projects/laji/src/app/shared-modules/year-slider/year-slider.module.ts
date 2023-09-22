import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { YearSliderComponent } from './year-slider.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule
  ],
  declarations: [
    YearSliderComponent,
  ],
  exports: [
    YearSliderComponent
  ]
})
export class YearSliderModule { }
