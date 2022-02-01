import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';
import { TranslateModule } from '@ngx-translate/core';
import { routing } from './home.routes';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    routing,
    CommonModule,
    TranslateModule,
  ]
})
export class HomeModule { }
