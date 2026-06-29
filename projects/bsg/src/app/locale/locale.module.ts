import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LocaleEsComponent } from './locale-es.component';
import { LocaleFrComponent } from './locale-fr.component';
import { LocaleZhComponent } from './locale-zh.component';

@NgModule({
  declarations: [
    LocaleEsComponent,
    LocaleFrComponent,
    LocaleZhComponent,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    LocaleEsComponent,
    LocaleFrComponent,
    LocaleZhComponent,
  ]
})
export class LocaleModule { }
