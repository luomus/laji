import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { MetadataApi } from '../api/MetadataApi';
import { Observer } from 'rxjs/Observer';
import { CollectionApi } from '../api/CollectionApi';


@Injectable()
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
        return Observable.of(this.collectionsLookup);
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
      .metadataFindPropertiesRanges('MY.collectionID', lang, false, true)
      .do(collections => { this.collectionsLookup = collections; })
      .share();
    this.currentLang = lang;

    return this.pending;
  }

  getName(id: string, lang) {
    return this.getAllAsLookUp(lang)
      .map(data => data.filter(col => col.id === id));
  }
}
