import { TranslateService } from '@ngx-translate/core';
import { isPlatformServer } from '@angular/common';

export abstract class LocaleComponent {

  protected translateService: TranslateService;
  protected window: any;
  protected platformId: any;

  protected setLocale(lang) {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    if (this.translateService.currentLang !== lang) {
      this.translateService.use(lang);
      this.translateService.setDefaultLang('fi');
    }
    try {
      this.window.document.documentElement.lang = lang;
    } catch (e) {
      console.log(e);
    }

  }

}
