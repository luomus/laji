import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { LajiApi, LajiApiService } from './laji-api.service';


@Injectable()
export class SourceService {

  private sources;
  private currentLang;
  private pending: Observable<any>;

  constructor(private lajiApi: LajiApiService) {
  }

  getAllAsLookUp(lang?: string): Observable<any> {
    if (!lang) {
      lang = this.currentLang || 'fi';
    }
    if (lang === this.currentLang) {
      if (this.sources) {
        return Observable.of(this.sources);
      } else if (this.pending) {
        return Observable.create((observer: Observer<any>) => {
          const onComplete = (res: any) => {
            observer.next(res);
            observer.complete();
          };
          this.pending.subscribe(
            () => { onComplete(this.sources); }
          );
        });
      }
    }
    this.pending = this.lajiApi
      .getList(LajiApi.Endpoints.sources, {lang, page: 1, pageSize: 1000})
      .map(paged => paged.results)
      .map(sources => {
        const lkObject = {};
        sources.map(source => { lkObject[source['id']] = source['name']; });
        return lkObject;
      })
      .do(locations => { this.sources = locations; })
      .share();
    this.currentLang = lang;

    return this.pending;
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang)
      .map(data => data[id] || id );
  }
}
