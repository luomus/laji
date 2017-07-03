import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { MetadataApi } from '../api/MetadataApi';
import { CacheService } from './cache.service';
import { MultiLangService } from './multi-lang.service';


@Injectable()
export class MetadataService {

  static readonly rangesCacheKey = 'ranges';

  private ranges;
  private pendingRanges: Observable<any>;

  constructor(private metadataApi: MetadataApi, private cacheService: CacheService) {
  }

  /**
   * Returns all ranges with multi lang parameter
   *
   * @returns Observable<any>
   */
  getAllRanges() {
    if (this.ranges) {
      return Observable.of(this.ranges);
    } else if (this.pendingRanges) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        this.pendingRanges.subscribe(
          (ranges) => {
            onComplete(ranges);
          }
        );
      });
    }
    this.pendingRanges = this.metadataApi.metadataFindAllRanges('multi')
      .do(ranges =>  this.cacheService.setItem(MetadataService.rangesCacheKey, ranges))
      .merge(this.cacheService.getItem(MetadataService.rangesCacheKey))
      .filter(ranges => !!ranges)
      .do(ranges => { this.ranges = ranges; })
      .share();

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
        .keys(ranges)
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
