import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

export const LAST_LANG_KEY = 'last-lang';

@Injectable()
export class LocalizeRouterService {

  currentLang: string;
  locales = ['fi', 'en', 'sv'];

  static translatePath(path: string, lang): string {
    if (path.match(/^\/(in|en|sv|fi)\b/)) {
      return path.replace(/^\/(in|en|sv|fi)\b/, lang === 'fi' ? '' : `/${lang}`);
    } else if (lang === 'fi' || path.startsWith('.')) {
      return path;
    }
    return `/${lang}${path}`;
  }

  constructor(
    private translateService: TranslateService,
    private location: Location
  ) { }

  translateRoute<T>(query: T, lang?: string): T;
  translateRoute(query: string | any[], lang?: string): string | any[] {
    if (!lang) {
      lang = this.translateService.currentLang;
    }
    if (typeof query === 'string') {
      return LocalizeRouterService.translatePath(query, lang);
    }
    const result: any[] = [];
    (query as Array<any>).forEach((segment: any, index: number) => {
      if (index === 0 && typeof segment === 'string' && segment.startsWith('/')) {
        result.push(LocalizeRouterService.translatePath(segment, lang));
      } else {
        result.push(segment);
      }
    });
    return result;
  }

  getPathWithoutLocale(path?: string) {
    const pathSlices = (path || this.location.path()).split('/');

    if (pathSlices.length > 1 && this.locales.indexOf(pathSlices[1]) !== -1) {
      return '/' + pathSlices.slice(2).join('/');
    } else if (pathSlices.length === 1) {
      return '/';
    }
    return pathSlices.join('/');
  }

  getLocationLang(path?: string): string {
    const pathSlices = (path || this.location.path()).split('/');

    if (pathSlices.length > 1 && this.locales.indexOf(pathSlices[1]) !== -1) {
      return pathSlices[1];
    }
    if (pathSlices.length && this.locales.indexOf(pathSlices[0]) !== -1) {
      return pathSlices[0];
    }
    return this.locales[0];
  }
}
