import { Observable, Observer } from 'rxjs';
import { WarehouseApi } from '../api/WarehouseApi';
import { Injectable } from '@angular/core';

@Injectable()
export class WarehouseValueMappingService {

  private mapping;
  private reverse;
  private pending: Observable<any>;

  constructor(private warehouseService: WarehouseApi) {
    this.pending = this.warehouseService.warehouseEnumerationLabels()
      .map(data => this.parseResult(data))
      .share();
  };

  public getOriginalKey(value): Observable<string> {
    return this.get(value, 'mapping');
  }

  public getWarehouseKey(value): Observable<string> {
    return this.get(value, 'reverse');
  }

  public get(value, list): Observable<string> {
    if (!this[list] && this.pending) {
      return Observable.create((observer: Observer<string>) => {
        const onComplete = (res: string) => {
          observer.next(res);
          observer.complete();
        };
        this.pending.subscribe((_: any) => {
          onComplete(this[list][value] || value);
        });
      });
    } else {
      return Observable.of(this[list][value] || value);
    }
  }

  private parseResult(result) {
    this.mapping = {};
    this.reverse = {};
    result.results.map(translation => {
      let key = translation.enumeration || '';
      let value = translation.property || '';
      this.mapping[key] = value;
      this.reverse[value] = key;
    });
  }
}
