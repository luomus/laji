import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { SourceApi } from '../api/SourceApi';


@Injectable()
export class SourceService {

  private areas;
  private currentLang;
  private pending: Observable<any>;

  constructor(private sourceApi: SourceApi) {
  }

  getAllAsLookUp(lang: string) {
    if (lang === this.currentLang) {
      if (this.areas) {
        return Observable.of(this.areas);
      } else if (this.pending) {
        return Observable.create((observer: Observer<any>) => {
          const onComplete = (res: any) => {
            observer.next(res);
            observer.complete();
          };
          this.pending.subscribe(
            () => { onComplete(this.areas); }
          );
        });
      }
    }
    this.pending = this.sourceApi
      .findAll(lang, undefined, '1', '1000')
      .map(paged => paged.results)
      .map(areas => {
        const lkObject = {};
        areas.map(area => { lkObject[area['id']] = area['name']; });
        return lkObject;
      })
      .do(locations => { this.areas = locations; })
      .share();
    this.currentLang = lang;

    return this.pending;
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang)
      .map(data => data[id] || id );
  }
}
