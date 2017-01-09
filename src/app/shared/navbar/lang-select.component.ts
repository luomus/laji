import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { CoreModule } from '../core.module';

@Component({
  selector: 'laji-lang-select',
  templateUrl: './lang-select.component.html',
  styleUrls: ['./lang-select.component.css'],
})
export class LangSelectComponent {
  constructor(public translate: TranslateService) {
  }

  switchLang(lang) {
    CoreModule.defaultLang = lang;
    this.translate.use(lang);
  }
}
