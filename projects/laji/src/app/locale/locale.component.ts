import { inject } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { LAST_LANG_KEY } from './localize-router.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { PlatformService } from '../root/platform.service';

import moment from 'moment';
import 'moment/locale/fi';
import 'moment/locale/sv';

export function setLocale(lang: string) {
  const platform = inject(PlatformService);
  const translate = inject(TranslateService);
  const api = inject(LajiApiClientBService);

  moment.locale(lang);
  api.setLang(lang);
  translate.use(lang);
  if (platform.isBrowser) {
    window.document.documentElement.lang = lang;
  }
}

export abstract class LocaleComponent {
  @LocalStorage(LAST_LANG_KEY) protected lastLang: string | undefined;

  protected constructor(
    private platformService: PlatformService,
    lang: string
  ) {
    this.setLocale(lang);
  }

  private setLocale(lang: string) {
    setLocale(lang);
    if (this.platformService.isBrowser) {
      this.lastLang = lang;
    }
  }
}
