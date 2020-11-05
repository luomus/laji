import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiLangPipe } from './pipe/multi-lang.pipe';
import { MultiLangAllPipe } from './pipe/multi-lang-all.pipe';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    MultiLangPipe,
    MultiLangAllPipe
  ],
  exports: [
    MultiLangPipe,
    MultiLangAllPipe,
    TranslateModule
  ]
})
export class LangModule { }
