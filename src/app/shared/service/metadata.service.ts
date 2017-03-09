import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Observer } from 'rxjs/Observer';
import { MetadataApi } from '../api/MetadataApi';


@Injectable()
export class MetadataService {

  private ranges;
  private pendingRanges: Observable<any>;
  private properties;
  private pendingProperties: Observable<any>;
  private currentLang;

  constructor(private metadataApi: MetadataApi) {
  }

  getAllProperties(lang: string) {
    if (lang === this.currentLang) {
      if (this.ranges) {
        return Observable.of(this.ranges);
      } else if (this.pendingRanges) {
        return Observable.create((observer: Observer<any>) => {
          const onComplete = (res: any) => {
            observer.next(res);
            observer.complete();
          };
          this.pendingRanges.subscribe(
            () => { onComplete(this.ranges); }
          );
        });
      }
    }
    this.pendingRanges = this.metadataApi.metadataFindAllRanges(lang)
      .do(ranges => { this.ranges = ranges; })
      .share();
    this.currentLang = lang;

    return this.pendingRanges;
  }

  getAllPropertiesAsLookUp(lang: string) {
    return this.getAllRanges(lang)
      .map(ranges => Object
        .keys(ranges)
        .reduce((total, key) => {
          ranges[key].map(range => {
            total[range['id']] = range['value'];
          });
          return total;
        }, {}))
      .share();
  }

  getAllRanges(lang: string) {
    if (lang === this.currentLang) {
      if (this.ranges) {
        return Observable.of(this.ranges);
      } else if (this.pendingRanges) {
        return Observable.create((observer: Observer<any>) => {
          const onComplete = (res: any) => {
            observer.next(res);
            observer.complete();
          };
          this.pendingRanges.subscribe(
            () => { onComplete(this.ranges); }
          );
        });
      }
    }
    this.pendingRanges = this.metadataApi.metadataFindAllRanges(lang)
      .do(ranges => { this.ranges = ranges; })
      .share();
    this.currentLang = lang;

    return this.pendingRanges;
  }

  getAllRangesAsLookUp(lang: string) {
    return this.getAllRanges(lang)
      .map(ranges => Object
        .keys(ranges)
        .reduce((total, key) => {
          ranges[key].map(range => {
            total[range['id']] = range['value'];
          });
          return total;
        }, {}))
      .share();
  }

  getRange(range: string, lang: string) {
    return this.getAllRanges(lang)
      .do(ran => console.log(range))
      .map(data => data[range] || [] );
  }
}
