import { LocalStorage } from 'ngx-webstorage';
import { LAST_LANG_KEY } from './localize-router.service';
import { PlatformService } from '../root/platform.service';

export abstract class LocaleComponent {

  @LocalStorage(LAST_LANG_KEY) protected lastLang: string | undefined;

  protected constructor(
    protected platformService: PlatformService,
  ) {}

  protected setLocale(lang: string) {
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
