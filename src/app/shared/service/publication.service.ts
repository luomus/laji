import {share, tap, catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
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
      this.pending[id] = this.lajiApi.get(LajiApi.Endpoints.publications, id, {lang}).pipe(
        catchError((err) => {
          return ObservableOf(undefined);
        }),
        tap((res) => {
          this.cache[id] = res;
        }),
        share()
      );
    }
    return this.pending[id];
  }

  private setLang(lang: string) {
    if (this.currentLang !== lang) {
      this.cache = {};
      this.pending = {};
      this.currentLang = lang;
    }
  }
}

