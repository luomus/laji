import { map } from 'rxjs';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import type { components } from 'projects/laji-api-client-b/generated/api';
import { dictionarifyByKey } from './util.service';

type Area = components['schemas']['store-area'];

@Injectable({providedIn: 'root'})
export class AreaService {

  constructor(private api: LajiApiClientBService) {}

  areasLookup?: Observable<{[id: string]: Area}>;

  getAllAsLookUp(): Observable<{[id: string]: Area}> {
    if (this.areasLookup) {
      return this.areasLookup;
    }
    this.areasLookup = this.api.get('/areas', { query: { page: 1, pageSize: 10000 } }).pipe(
      map(paged => dictionarifyByKey(paged.results, 'id')),
      shareReplay(1)
    );
    return this.areasLookup;
  }

  getProvinceCode(id: string) {
    return this.getAllAsLookUp().pipe(
      map(data => data[id] && data[id].provinceCodeAlpha)
    );
  }

  getName(id: string) {
    return this.getAllAsLookUp().pipe(
      map(data => data[id] && data[id].name || id)
    );
  }

  public getAreaByType(type: Area['areaType']): Observable<{id: string; value: string}[]> {
    return this.getAllAsLookUp().pipe(
      map(area => {
        if (!area) {
          return [];
        }
        return Object.keys(area).reduce((total, key) => {
          if (area[key].areaType === type) {
            total.push({id: key, value: area[key].name ?? area[key].id});
          }
          return total;
        }, [] as {id: string; value: string}[]);
      }));
  }
}
