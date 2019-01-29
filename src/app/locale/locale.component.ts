import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

export abstract class LocaleComponent {

  protected translateService: TranslateService;
  protected window: any;
  protected platformId: any;

  protected setLocale(lang) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.window.document.documentElement.lang = lang;
      } catch (e) {
        console.log(e);
      }
    }
  }

}
