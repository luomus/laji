import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { map, shareReplay, take } from 'rxjs/operators';
import { BaseDataService } from '../../graph-ql/service/base-data.service';

interface LabelData {
  mapping: Record<string, string>;
  reverse: Record<string, string>;
}

@Injectable({providedIn: 'root'})
export class WarehouseValueMappingService {

  private labels$: Observable<any>;

  constructor(
    private baseDataService: BaseDataService
  ) {
    this.labels$ = this.baseDataService.getBaseData().pipe(
      map(data => data.warehouseLabels),
      map(data => this.parseResult(data)),
      shareReplay(1)
    );
  }

  public getSchemaKey(value: string): Observable<string> {
    return this.get(value, 'mapping');
  }

  public getWarehouseKey(value: boolean|string|number): Observable<string> {
    return this.get('' + value, 'reverse');
  }

  public get(value: string, list: keyof LabelData): Observable<string> {
    return this.labels$.pipe(
      map(data => data && data[list] && data[list][value] || value),
      take(1)
    );
  }

  private parseResult(data: {enumeration: string; property: string; }[]) {
    const result: LabelData = {
      mapping: {},
      reverse: {}
    };
    data.forEach(mapping => {
      const key = mapping.enumeration || '';
      const value = mapping.property || '';
      if (key && value) {
        result.mapping[key] = value;
        result.reverse[value] = key;
      }
    });
    return result;
  }
}
