import { Observable } from 'rxjs';
import { WarehouseApi } from '../api/WarehouseApi';
import { Injectable } from '@angular/core';
import { map, shareReplay, take, timeout } from 'rxjs/operators';
import { BaseDataService } from '../../graph-ql/service/base-data.service';

@Injectable({providedIn: 'root'})
export class WarehouseValueMappingService {

  private request: Observable<any>;

  constructor(
    private baseDataService: BaseDataService
  ) {}

  public getOriginalKey(value: string): Observable<string> {
    return this.get(value, 'mapping');
  }

  public getWarehouseKey(value): Observable<string> {
    return this.get(value, 'reverse');
  }

  public get(value, list): Observable<string> {
    return this.fetchLabels().pipe(
      map(data => data && data[list] && data[list][value] || value)
    );
  }

  private parseResult(data) {
    const result = {
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

  private fetchLabels() {
    if (!this.request) {
      this.request = this.baseDataService.getBaseData().pipe(
        take(1),
        map(data => data.warehouseLabels),
        timeout(WarehouseApi.longTimeout),
        map(data => this.parseResult(data)),
        shareReplay(1)
      );
    }
    return this.request;
  }
}
