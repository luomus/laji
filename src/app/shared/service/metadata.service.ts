import { Injectable } from '@angular/core';
import { Observable ,  Observer ,  Subject, of as ObservableOf } from 'rxjs';
import { MetadataApi } from '../api/MetadataApi';
import { CacheService } from './cache.service';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';
import { Util } from './util.service';
import { delay, filter, map, merge, retryWhen, share, take, tap } from 'rxjs/operators';


@Injectable({providedIn: 'root'})
export class MetadataService {

  static readonly rangesCacheKey = 'ranges';

  private ranges;
  private source = new Subject<any>();
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
      if (!this.source.isStopped) {
        this.source.complete();
      }
      return ObservableOf(this.ranges);
    } else if (this.pendingRanges) {
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
    this.pendingRanges = this.source
      .asObservable().pipe(
        share()
      );

    this.cacheService.getItem(MetadataService.rangesCacheKey).pipe(
      merge(this.metadataApi.metadataFindAllRanges('multi').pipe(
        retryWhen(errors => errors.pipe(
          delay(1000),
          take(3)
        )),
        tap(ranges =>  {
          if (!Util.isEmptyObj(ranges)) {
            this.cacheService.setItem(MetadataService.rangesCacheKey, ranges).subscribe(() => {}, () => {});
          }
        })
      )),
      filter(ranges => {
        return !Util.isEmptyObj(ranges);
      })
    )
      .subscribe(ranges => {
        this.ranges = ranges;
        this.source.next(ranges);
      });

    return this.pendingRanges;
  }

  /**
   * Gets all ranges as lookup object
   *
   * @param lang
   * @returns {Observable<T>}
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
      ),
      share()
    );
  }

  /**
   * Gets a specific range of all the ranges
   *
   * @param range
   */
  getRange(range: string): Observable<any[]> {
    return this.getAllRanges().pipe(
      map(data => data[range] || [] )
    );
  }

}
