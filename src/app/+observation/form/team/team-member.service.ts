import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { map, share, tap } from 'rxjs/operators';
import { Observable, of as ObservableOf } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {

  memberCache: {[id: string]: string} = {};
  fetcher = {};

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getName(id: string): Observable<string> {
    if (!id) {
      return ObservableOf('');
    }
    if (this.memberCache[id]) {
      return ObservableOf(this.memberCache[id]);
    }
    if (!this.fetcher[id]) {
      this.fetcher[id] = this.warehouseApi.warehouseTeamMemberGet(id).pipe(
        map(result => result.name || result.id),
        tap((name: string) => this.memberCache[id] = name),
        share()
      );
    }
    return this.fetcher[id];
  }

  getMembers(search: string): Observable<{name: string, id: string}[]> {
    if (!search) {
      return ObservableOf([]);
    }
    if (!search.endsWith('*')) {
      search += '*';
    }
    return this.warehouseApi.warehouseTeamMemberFind(search).pipe(
      map(result => result.results || []),
      tap(members => {
        this.memberCache = {...this.memberCache, ...members.reduce((cumulative, current) => {
          cumulative[current['id']] = current['name'];
          return cumulative;
        }, {})};
      })
    )
  }

}
