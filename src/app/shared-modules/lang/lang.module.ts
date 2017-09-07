import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiLangPipe } from './pipe/multi-lang.pipe';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    MultiLangPipe
  ],
  exports: [
    MultiLangPipe,
    TranslateModule
  ]
})
export class LangModule { }
