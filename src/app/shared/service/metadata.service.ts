import { Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { MetadataApi } from '../api/MetadataApi';
import { CacheService } from './cache.service';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';
import { Util } from './util.service';
import { filter, map, merge, share, tap } from 'rxjs/operators';


@Injectable({providedIn: 'root'})
export class MetadataService {

  static readonly rangesCacheKey = 'ranges';

  private ranges;
  private pendingRanges: Observable<any>;

  constructor(private metadataApi: MetadataApi, private cacheService: CacheService) {
  }

  getClassProperties(className: string) {
    return this.metadataApi.metadataFindClassProperties(className, 'multi').pipe(
      map(result => result.results)
    );
  }

  /**
   * Returns all ranges with multi lang parameter
   *
   * @returns Observable<any>
   */
  getAllRanges() {
    if (this.ranges) {
      return ObservableOf(this.ranges);
    } else if (!this.pendingRanges) {
      this.pendingRanges = this.cacheService.getItem(MetadataService.rangesCacheKey).pipe(
        merge(this.metadataApi.metadataFindAllRanges('multi').pipe(
          tap(data => {
            if (!Util.isEmptyObj(data)) {
              this.cacheService.setItem(MetadataService.rangesCacheKey, data).subscribe();
            }
          })
          )
        ),
        filter(result => {
          return !Util.isEmptyObj(result);
        }),
        tap(ranges => {
          this.ranges = ranges;
        }),
        share()
      );
    }

    return Observable.create((observer: Observer<any>) => {
      this.pendingRanges.subscribe(
        (ranges) => {
          observer.next(ranges);
          observer.complete();
        },
        (err) => console.log(err)
      );
    });
  }

  /**
   * Gets all ranges as lookup object
   *
   * @returns Observable<T>
   */
  getAllRangesAsLookUp(lang: string) {
    return this.getAllRanges().pipe(
      map(ranges => Object
        .keys(ranges || {})
        .reduce((total, key) => {
          ranges[key].map(range => {
            total[range['id']] = MultiLangService.getValue(range['value'], lang, range['id']);
          });
          return total;
        }, {})
      )
    );
  }

  /**
   * Gets a specific range of all the ranges
   *
   */
  getRange(range: string): Observable<any[]> {
    return this.getAllRanges().pipe(
      map(data => data[range] || [] )
    );
  }

}
