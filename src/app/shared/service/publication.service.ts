import { Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { Publication } from '../model/Publication';
import { LajiApi, LajiApiService } from './laji-api.service';


@Injectable({providedIn: 'root'})
export class PublicationService {
  private currentLang: string;
  private cache: {[key: string]: any} = {};
  private pending: {[key: string]: Observable<any>} = {};

  constructor(private lajiApi: LajiApiService) {
  }

  public getPublication(id: string, lang: string): Observable<Publication> {
    this.setLang(lang);

    if (this.cache[id]) {
      return ObservableOf(this.cache[id]);
    } else if (!this.pending[id]) {
      this.pending[id] = this.lajiApi.get(LajiApi.Endpoints.publications, id, {lang})
        .catch((err) => undefined)
        .do((res) => this.cache[id] = res)
        .share();
    }
    return Observable.create((observer: Observer<string>) => {
      this.pending[id].subscribe(data => {
        observer.next(data);
        observer.complete();
      });
    });
  }

  private setLang(lang: string) {
    if (this.currentLang !== lang) {
      this.cache = {};
      this.pending = {};
      this.currentLang = lang;
    }
  }
}

