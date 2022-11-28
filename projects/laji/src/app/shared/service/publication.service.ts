import { catchError, share, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { Publication } from '../model/Publication';
import { LajiApi, LajiApiService } from './laji-api.service';

@Injectable({providedIn: 'root'})
export class PublicationService {
  private cache: {[key: string]: any} = {};
  private pending: {[key: string]: Observable<any>} = {};

  constructor(private lajiApi: LajiApiService) {
  }

  public getPublication(id: string, lang: string): Observable<Publication> {
    if (this.cache[id]) {
      return ObservableOf(this.cache[id]);
    } else if (!this.pending[id]) {
      this.pending[id] = this.lajiApi.get(LajiApi.Endpoints.publications, id, {lang}).pipe(
        catchError(() =>
          ObservableOf(undefined)
        ),
        tap((res) => {
          this.cache[id] = res;
        }),
        share()
      );
    }
    return this.pending[id];
  }

}

