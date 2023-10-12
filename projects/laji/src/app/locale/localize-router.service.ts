import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { environment } from '../../environments/environment';

export const LAST_LANG_KEY = 'last-lang';

export const DEFAULT_LANG = (environment as any).defaultLang ?? 'fi';
export const LANGUAGES = (environment as any).languages ?? ['fi', 'en', 'sv'];

@Injectable()
export class LocalizeRouterService {

  static translatePath(path: string, lang): string {
    const reg = new RegExp('^\/(in|' + LANGUAGES.join('|') + ')\\b'); // /^\/(in|en|sv|fi)\b/

    if (path.match(reg)) {
      return path.replace(reg, lang === DEFAULT_LANG ? '' : `/${lang}`);
    } else if (lang === DEFAULT_LANG || path.startsWith('.')) {
      return path;
    } else if (path === '/') {
      path = '';
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

    if (pathSlices.length > 1 && LANGUAGES.indexOf(pathSlices[1]) !== -1) {
      return '/' + pathSlices.slice(2).join('/');
    } else if (pathSlices.length === 1) {
      return '/';
    }
    return pathSlices.join('/');
  }

  getLocationLang(path?: string): string {
    const pathSlices = (path || this.location.path()).split('/');

    if (pathSlices.length > 1 && LANGUAGES.indexOf(pathSlices[1]) !== -1) {
      return pathSlices[1];
    }
    if (pathSlices.length && LANGUAGES.indexOf(pathSlices[0]) !== -1) {
      return pathSlices[0];
    }
    return DEFAULT_LANG;
  }
}
