import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    TranslateModule,
  ]
})
export class HomeModule { }
