import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Information, LajiApiClient, PagedResult, Taxon } from 'projects/laji-api-client/src/public-api';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export type Lang = 'fi' | 'sv' | 'en';

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

const cacheReturnObservable = () => (
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = function(this: any, ...args: any[]) {
      const hash = hashArgs(...args, this.translate.currentLang);
      if (!this.cache) {
        this.cache = {};
      }
      if (!this.cache[propertyKey]) {
        this.cache[propertyKey] = {};
      }
      if (hash in this.cache[propertyKey]) {
        return of(this.cache[propertyKey][hash]);
      }
      return original.apply(this, args).pipe(
        tap(val => this.cache[propertyKey][hash] = val)
      );
    };
  }
);

@Injectable({providedIn: 'root'})
export class ApiService {
  constructor(private api: LajiApiClient, private translate: TranslateService, private http: HttpClient) {}

  @cacheReturnObservable()
  getInformation(id: string): Observable<Information> {
    return this.api.get(
      LajiApiClient.Endpoints.information,
      id, {lang: <Lang>this.translate.currentLang}
    );
  }

  @cacheReturnObservable()
  getTaxon(id: string, params: LajiApiClient.TaxonFindParams = {}): Observable<Taxon> {
    return this.api.get(
      LajiApiClient.Endpoints.taxon,
      id,
      { lang: <Lang>this.translate.currentLang, ...params }
    ).pipe(
      map(taxa => <Taxon><unknown>taxa) // ApiClient typing is wrong here
    );
  }

  @cacheReturnObservable()
  getTaxa(id: string, params: LajiApiClient.TaxonFindParams = {}): Observable<PagedResult<Taxon>> {
    return this.http.get( // ApiClient doesn't support this endpoint atm
      this.api.configuration.basePath + `/taxa/${id}/species`,
      { params: { lang: <Lang>this.translate.currentLang, ...params } }
    ).pipe(
      map(taxa => <PagedResult<Taxon>><unknown>taxa)
    );
  }
}
