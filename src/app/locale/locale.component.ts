import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { GlobalStore } from '../shared/store/global.store';

export abstract class LocaleComponent {

  protected translateService: TranslateService;
  protected window: any;
  protected platformId: any;
  protected store: GlobalStore;

  protected setLocale(lang) {
    this.store.setCurrentLang(lang);
    if (this.translateService.getDefaultLang() !== 'fi' && lang !== 'fi') {
      this.translateService.setDefaultLang('fi');
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.translateService.currentLang !== lang) {
      this.translateService.use(lang);
    }
    try {
      this.window.document.documentElement.lang = lang;
    } catch (e) {
      console.log(e);
    }

  }

}
