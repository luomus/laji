import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { components } from 'projects/laji-api-client/generated/api.d';
import { dictionarifyByKey } from '../utils';

type Checklist = components['schemas']['store-checklist'];

@Injectable({providedIn: 'root'})
export class ChecklistService {

  constructor(
    private api: LajiApiClientService,
  ) {
  }

  private lookup?: Observable<{[id: string]: Pick<Checklist, 'id' | 'name'>}>;

  getAllAsLookUp(): Observable<{[id: string]: Pick<Checklist, 'id' | 'name'>}> {
    if (this.lookup) {
      return this.lookup;
    }
    this.lookup = this.api.get('/checklists', { query: { page: 1, pageSize: 100000, selectedFields: 'id,name' } }).pipe(
      map(paged => dictionarifyByKey(paged.results, 'id')),
    );
    return this.lookup;
  }
}
