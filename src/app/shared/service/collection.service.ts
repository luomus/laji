import { tap, share } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { MetadataApi } from '../api/MetadataApi';


@Injectable({providedIn: 'root'})
export class CollectionService {

  private collectionsLookup;
  private currentLang;
  private pending: Observable<any>;

  constructor(
    private metadataService: MetadataApi
  ) {
  }

  getAllAsLookUp(lang: string) {
    if (lang === this.currentLang) {
      if (this.collectionsLookup) {
        return ObservableOf(this.collectionsLookup);
      } else if (this.pending) {
        return Observable.create((observer: Observer<any>) => {
          const onComplete = (res: any) => {
            observer.next(res);
            observer.complete();
          };
          this.pending.subscribe(
            () => { onComplete(this.collectionsLookup); }
          );
        });
      }
    }
    this.pending = this.metadataService
      .metadataFindPropertiesRanges('MY.collectionID', lang, false, true).pipe(
        tap(collections => { this.collectionsLookup = collections; }),
        share()
      );
    this.currentLang = lang;

    return this.pending;
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang)
      .map(data => data.filter(col => col.id === id));
  }
}
