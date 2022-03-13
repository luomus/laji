import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Information, LajiApiClient, PagedResult, Taxon } from 'projects/laji-api-client/src/public-api';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export type LangM = LajiApiClient.LangWithMultiEnum;
export type Lang = LajiApiClient.LangEnum;

// hash fn source: https://stackoverflow.com/a/15710692
// eslint-disable-next-line no-bitwise
const hashCode = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
const concatObjProps = (obj) => concatArgs(Object.entries(obj).map(([k, v]) => k + v));
const concatArgs = (...args): string => (
  args.reduce((prev, curr) => {
    if (curr instanceof Array) {
      return prev += concatArgs(...curr);
    }
    if (curr instanceof Object) {
      return prev += concatObjProps(curr);
    }
    return prev += curr;
  }, '')
);
const hashArgs = (...args) => hashCode(concatArgs(...args));

export const cacheReturnObservable = (cacheInvalidationMs?: number) => (
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = function(this: any, ...args: any[]) {
      const hash = hashArgs(...args);
      if (!this.cache) {
        this.cache = {};
      }
      if (!this.cache[propertyKey]) {
        this.cache[propertyKey] = { val: {}, lastRefresh: 0};
      }
      if (hash in this.cache[propertyKey] && (
          cacheInvalidationMs === undefined
          || Date.now() - this.cache[propertyKey][hash].lastRefresh < cacheInvalidationMs)
      ) {
        return of(this.cache[propertyKey][hash].val);
      }
      return original.apply(this, args).pipe(
        tap(val => {
          this.cache[propertyKey][hash] = {
            val,
            lastRefresh: Date.now()
          };
        })
      );
    };
  }
);

@Injectable({providedIn: 'root'})
export class LajiApiService {
  constructor(private api: LajiApiClient, private translate: TranslateService) {}

  @cacheReturnObservable(604800000) // 1 week
  getInformation(id: string, lang: Lang = <Lang>this.translate.currentLang): Observable<Information> {
    return this.api.get(
      LajiApiClient.Endpoints.information,
      id, {lang}
    );
  }

  @cacheReturnObservable(60000) // 1 minute
  getTaxon(id: string, params: LajiApiClient.TaxonFindParams = {}, lang: LangM = <Lang>this.translate.currentLang): Observable<Taxon> {
    return this.api.get(
      LajiApiClient.Endpoints.taxon,
      id,
      { lang, ...params }
    ).pipe(
      map(taxa => <Taxon><unknown>taxa) // API doesn't return PagedResult if id is supplied as route param
    );
  }

  @cacheReturnObservable(604800000) // 1 week
  getTaxa(id: string, params: LajiApiClient.TaxonFindParams = {}, lang: LangM = <Lang>this.translate.currentLang): Observable<PagedResult<Taxon>> {
    return this.api.get(
      LajiApiClient.Endpoints.taxon,
      '',
      { lang, parentTaxonId: id, ...params }
    );
  }
}
