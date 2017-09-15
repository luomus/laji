import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { SourceApi } from '../api/SourceApi';


@Injectable()
export class SourceService {

  private sources;
  private currentLang;
  private pending: Observable<any>;

  constructor(private sourceApi: SourceApi) {
  }

  getAllAsLookUp(lang: string): Observable<any> {
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
    this.pending = this.sourceApi
      .findAll(lang, undefined, '1', '1000')
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
