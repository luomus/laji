import { Observable } from 'rxjs';
import { WarehouseApi } from '../api/WarehouseApi';
import { Injectable } from '@angular/core';
import { delay, map, retryWhen, shareReplay, take, timeout } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class WarehouseValueMappingService {

  private request: Observable<any>;

  constructor(private warehouseService: WarehouseApi) {}

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
    data.results.forEach(mapping => {
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
      this.request = this.warehouseService.warehouseEnumerationLabels().pipe(
        timeout(WarehouseApi.longTimeout),
        retryWhen(errors => errors.pipe(
          delay(1000),
          take(3)
        )),
        map(data => this.parseResult(data)),
        shareReplay(1)
      );
    }
    return this.request;
  }
}
