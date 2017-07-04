import { TranslateService } from '@ngx-translate/core';
import { WindowRef } from '../shared/windows-ref';
export abstract class LocaleComponent {

  protected translateService: TranslateService;
  protected windowRef: WindowRef;

  protected setLocale(lang) {
    if (this.translateService.currentLang !== lang) {
      this.translateService.use(lang);
      this.translateService.setDefaultLang('fi');
    }
    try {
      this.windowRef.nativeWindow.document.documentElement.lang = lang;
    } catch (e) {
      console.log(e);
    }

  }

}
