import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LocaleEnComponent } from './locale-en.component';
import { LocaleFiComponent } from './locale-fi.component';
import { LocaleSvComponent } from './locale-sv.component';

@NgModule({
  declarations: [
    LocaleEnComponent,
    LocaleFiComponent,
    LocaleSvComponent,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    LocaleEnComponent,
    LocaleFiComponent,
    LocaleSvComponent
  ]
})
export class LocaleModule { }
