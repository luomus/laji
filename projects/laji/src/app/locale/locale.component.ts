import { LocalStorage } from 'ngx-webstorage';
import { LAST_LANG_KEY } from './localize-router.service';
import { PlatformService } from '../root/platform.service';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import moment from 'moment';

export abstract class LocaleComponent {

  @LocalStorage(LAST_LANG_KEY) protected lastLang: string | undefined;

  protected constructor(
    private platformService: PlatformService,
    private translateService: TranslateService,
    private api: LajiApiClientBService,
    lang: string
  ) {
    this.setLocale(lang);
  }

  private setLocale(lang: string) {
    this.translateService.use(lang);
    this.api.setLang(lang);
    const defaultLang = (environment as any).defaultLang ?? 'fi';
    if (this.translateService.getFallbackLang() !== defaultLang && lang !== defaultLang) {
      this.translateService.setFallbackLang(defaultLang);
    }
    moment.locale(lang);
    if (this.platformService.isBrowser) {
      this.lastLang = lang;
      try {
        window.document.documentElement.lang = lang;
      } catch (e) {
        console.log(e);
      }
    }
  }

}
