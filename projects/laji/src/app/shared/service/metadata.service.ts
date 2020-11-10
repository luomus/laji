import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { BaseDataService } from '../../graph-ql/service/base-data.service';


@Injectable({providedIn: 'root'})
export class MetadataService {

  constructor(
    private baseDataService: BaseDataService
  ) {
  }

  /**
   * Gets a specific range of all the ranges
   */
  getRange(range: string): Observable<{id: any, label: string, }[]> {
    return this.baseDataService.getBaseData().pipe(
      take(1),
      map(data => data.alts),
      map(alts => (alts || []).find(alt => alt.id === range)),
      map(alt => alt && alt.options || [])
    );
  }

}
