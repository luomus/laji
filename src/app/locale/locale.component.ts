import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorage } from 'ngx-webstorage';
import { LAST_LANG_KEY } from './localize-router.service';

export abstract class LocaleComponent {

  @LocalStorage(LAST_LANG_KEY) protected lastLang;
  protected translateService: TranslateService;
  protected window: any;
  protected platformId: any;

  protected setLocale(lang) {
    if (isPlatformBrowser(this.platformId)) {
      this.lastLang = lang;
      try {
        this.window.document.documentElement.lang = lang;
      } catch (e) {
        console.log(e);
      }
    }
  }

}
