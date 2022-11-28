import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiLangPipe } from './pipe/multi-lang.pipe';
import { MultiLangAllPipe } from './pipe/multi-lang-all.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLangRowsPipe } from './pipe/multi-lang-rows.pipe';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    MultiLangPipe,
    MultiLangAllPipe,
    MultiLangRowsPipe
  ],
  exports: [
    MultiLangPipe,
    MultiLangAllPipe,
    MultiLangRowsPipe,
    TranslateModule
  ]
})
export class LangModule { }
