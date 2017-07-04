import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { Route, Routes } from '@angular/router';

@Injectable()
export class LocalizeRouterService {

  currentLang: string;
  defaultLang = 'fi';
  locales = ['fi', 'en', 'sv'];


  static traslateRoutes(routes: Routes, lang) {
    for (const idx in routes) {
      if (routes[idx].redirectTo && !routes[idx].redirectTo.indexOf('/')) {
        routes[idx] = {...routes[idx], redirectTo: `/${lang}${routes[idx].redirectTo}`};
      }
    }
    return routes;
  }

  constructor(private translateService: TranslateService, private location: Location) {
    this.translateService.onLangChange
      .subscribe(() => {

      });
  }

  translateRoute<T>(query: T, lang?: string): T;
  translateRoute(query: string | any[], lang?: string): string | any[] {
    if (!lang) {
      lang = this.translateService.currentLang;
    }
    if (lang === this.defaultLang) {
      return query;
    }
    if (typeof query === 'string') {
      if (query.indexOf('/') === 0) {
        return query.length > 1 ? `/${lang}${query}` : `/${lang}`;
      }
      return query;
    }
    const result: any[] = [];
    (query as Array<any>).forEach((segment: any, index: number) => {
      if (typeof segment === 'string') {
        if (!index && !segment.indexOf('/')) {
          result.push(`/${lang}${segment}`);
        } else {
          result.push(segment);
        }
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
    return this.defaultLang;
  }
}
