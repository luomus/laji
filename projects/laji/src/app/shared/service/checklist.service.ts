import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { dictionarifyByKey } from '../utils';

type Checklist = components['schemas']['store-checklist'];

@Injectable({providedIn: 'root'})
export class ChecklistService {

  constructor(
    private api: LajiApiClientBService,
  ) {
  }

  private lookup?: Observable<{[id: string]: Checklist}>;

  getAllAsLookUp(): Observable<{[id: string]: Checklist}> {
    if (this.lookup) {
      return this.lookup;
    }
    this.lookup = this.api.get('/checklists', { query: { page: 1, pageSize: 100000 } }).pipe(
      map(paged => dictionarifyByKey(paged.results, 'id')),
    );
    return this.lookup;
  }

  getName(id: string) {
    return this.getAllAsLookUp().pipe(
      map(data => data[id] || id )
    );
  }
}
