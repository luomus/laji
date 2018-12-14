import { Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { LajiApi, LajiApiService } from './laji-api.service';
import { map, share, tap } from 'rxjs/operators';


@Injectable({providedIn: 'root'})
export class ChecklistService {

  private checklists;
  private currentLang;
  private pending: Observable<any>;

  constructor(private lajiApi: LajiApiService) {
  }

  getAllAsLookUp(lang?: string): Observable<any> {
    if (!lang) {
      lang = this.currentLang || 'fi';
    }
    if (lang === this.currentLang) {
      if (this.checklists) {
        return ObservableOf(this.checklists);
      } else if (this.pending) {
        return Observable.create((observer: Observer<any>) => {
          const onComplete = (res: any) => {
            observer.next(res);
            observer.complete();
          };
          this.pending.subscribe(
            () => { onComplete(this.checklists); }
          );
        });
      }
    }
    this.pending = this.lajiApi.getList(LajiApi.Endpoints.checklists, {lang, page: 1, pageSize: 1000}).pipe(
      map(paged => paged.results),
      map(checklists => {
        const lkObject = {};
        checklists.map(checklist => { lkObject[checklist['id']] = checklist['dc:bibliographicCitation']; });
        return lkObject;
      }),
      tap(locations => { this.checklists = locations; }),
      share()
    );
    this.currentLang = lang;

    return this.pending;
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang).pipe(
      map(data => data[id] || id )
    );
  }
}

