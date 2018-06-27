import { Injectable } from '@angular/core';
import { Observable ,  Observer ,  Subject, of as ObservableOf } from 'rxjs';
import { MetadataApi } from '../api/MetadataApi';
import { CacheService } from './cache.service';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';
import { Util } from './util.service';


@Injectable()
export class MetadataService {

  static readonly rangesCacheKey = 'ranges';

  private ranges;
  private source = new Subject<any>();
  private pendingRanges: Observable<any>;

  constructor(private metadataApi: MetadataApi, private cacheService: CacheService) {
  }

  getClassProperties(className: string) {
    return this.metadataApi.metadataFindClassProperties(className, 'multi')
      .map(result => result.results);
  }

  /**
   * Returns all ranges with multi lang parameter
   *
   * @returns Observable<any>
   */
  getAllRanges() {
    if (this.ranges) {
      return ObservableOf(this.ranges);
    } else if (this.pendingRanges) {
      return Observable.create((observer: Observer<any>) => {
        this.pendingRanges.subscribe(
          (ranges) => {
            observer.next(ranges);
          },
          (err) => console.log(err),
          () => observer.complete()
        );
      });
    }
    this.pendingRanges = this.source
      .asObservable()
      .share();

    this.cacheService.getItem(MetadataService.rangesCacheKey)
      .merge(this.metadataApi.metadataFindAllRanges('multi')
        .retryWhen(errors => errors.delay(1000).take(2).concat(ObservableOf(false)))
        .do(ranges =>  {
          if (!Util.isEmptyObj(ranges)) {
            this.cacheService.setItem(MetadataService.rangesCacheKey, ranges).subscribe(() => {}, () => {});
          }
        })
      )
      .filter(ranges => {
        return !Util.isEmptyObj(ranges);
      })
      .subscribe(ranges => {
        this.ranges = ranges;
        this.source.next(ranges);
        this.source.complete();
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
    return this.getAllRanges()
      .map(ranges => Object
        .keys(ranges || {})
        .reduce((total, key) => {
          ranges[key].map(range => {
            total[range['id']] = MultiLangService.getValue(range['value'], lang, range['id']);
          });
          return total;
        }, {}))
      .share();
  }

  /**
   * Gets a specific range of all the ranges
   *
   * @param range
   */
  getRange(range: string) {
    return this.getAllRanges()
      .map(data => data[range] || [] );
  }

}
