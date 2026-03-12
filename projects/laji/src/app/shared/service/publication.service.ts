import { catchError, share, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { Publication } from '../model/Publication';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Injectable({providedIn: 'root'})
export class PublicationService {
  private cache: {[key: string]: any} = {};
  private pending: {[key: string]: Observable<any>} = {};

  constructor(private api: LajiApiClientBService) {}

  public getPublication(id: string): Observable<Publication> {
    if (this.cache[id]) {
      return ObservableOf(this.cache[id]);
    } else if (!this.pending[id]) {
      this.pending[id] = this.api.get('/publications/{id}', { path: { id }}).pipe(
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
