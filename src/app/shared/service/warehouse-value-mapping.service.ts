
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { WarehouseApi } from '../api/WarehouseApi';
import { Injectable, OnInit } from '@angular/core';
import { delay, map, retryWhen, share, take, timeout } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class WarehouseValueMappingService implements OnInit {

  private mapping;
  private reverse;
  private pending: Observable<any>;

  constructor(private warehouseService: WarehouseApi) { };

  ngOnInit() {
    if (!this.pending) {
      this.pending = this.fetchLabels();
    }
  }

  public getOriginalKey(value): Observable<string> {
    return this.get(value, 'mapping');
  }

  public getWarehouseKey(value): Observable<string> {
    return this.get(value, 'reverse');
  }

  public get(value, list): Observable<string> {
    if (!this[list]) {
      if (!this.pending) {
        this.pending = this.fetchLabels();
      }
      return Observable.create((observer: Observer<string>) => {
        const onComplete = (res: string) => {
          observer.next(res);
          observer.complete();
        };
        this.pending.subscribe(
          (_: any) => { onComplete(this[list][value] || value); },
          () => { onComplete(value); }
          );
      });
    } else {
      return ObservableOf(this[list][value] || value);
    }
  }

  private parseResult(result) {
    this.mapping = {};
    this.reverse = {};
    result.results.map(translation => {
      const key = translation.enumeration || '';
      const value = translation.property || '';
      this.mapping[key] = value;
      this.reverse[value] = key;
    });
  }

  private fetchLabels() {
    return this.warehouseService.warehouseEnumerationLabels().pipe(
      timeout(WarehouseApi.longTimeout),
      retryWhen(errors => errors.pipe(
        delay(1000),
        take(3)
      )),
      map(data => this.parseResult(data)),
      share()
    );
  }
}
