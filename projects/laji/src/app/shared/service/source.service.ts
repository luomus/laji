import { Injectable } from '@angular/core';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { map, Observable } from 'rxjs';
import { dictionarifyByKey } from '../utils';
import type { components } from 'projects/laji-api-client/generated/api';

type Source = components['schemas']['SensitiveSource'];

@Injectable({providedIn: 'root'})
export class SourceService {

  constructor(
    private api: LajiApiClientService,
  ) {
  }

  private lookup?: Observable<{[id: string]: Source}>;

  getAllAsLookUp() {
    if (this.lookup) {
      return this.lookup;
    }
    this.lookup = this.api.get('/sources', { query: { page: 1, pageSize: 100000, selectedFields: 'id,name' } }).pipe(
      map(paged => dictionarifyByKey(paged.results, 'id'))
    );
    return this.lookup;
  }

  getName(id: string) {
    return this.getAllAsLookUp().pipe(
      map(data => data[id]?.name || id )
    );
  }
}
