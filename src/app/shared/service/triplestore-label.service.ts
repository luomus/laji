import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Injectable } from '@angular/core';
import { MetadataApi } from '../api/MetadataApi';
import { Logger } from '../logger/logger.service';
import { MetadataService } from './metadata.service';
import { CacheService } from './cache.service';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';

@Injectable()
export class TriplestoreLabelService {

  static readonly cacheTriplestoreLabels = 'triplestoreLabels';

  private labels;
  private pending: Observable<any>;

  constructor(private metadataApi: MetadataApi,
              private metadataService: MetadataService,
              private logger: Logger,
              private cacheService: CacheService
  ) {
    this.getAllLabels();
  };

  public get(key, lang): Observable<string> {
    if (this.labels) {
      return Observable.of(MultiLangService.getValue(this.labels[key], lang));
    } else if (this.pending) {
      return Observable.create((observer: Observer<string>) => {
        const onComplete = (res: string) => {
          observer.next(res);
          observer.complete();
        };
        this.pending.subscribe(
          (labels) => {
            onComplete(MultiLangService.getValue(labels ? labels[key] : '', lang));
          },
          err => this.logger.warn('Failed to fetch label for ' + key, err)
        );
      });
    } else {
      return Observable.of(MultiLangService.getValue(this.labels[key], lang));
    }
  }

  private getAllLabels() {
    this.pending = Observable.forkJoin(
      Observable.of('')
        .delay(200)
        .switchMap(() => this.metadataService.getAllRangesAsLookUp('multi'))
        .retryWhen(errors => errors.delay(1000).take(3).concat(Observable.throw(errors))),
      Observable.of('')
        .delay(200)
        .switchMap(() => this.metadataApi.metadataAllProperties('multi'))
        .retryWhen(errors => errors.delay(1000).take(3).concat(Observable.throw(errors))),
      Observable.of('')
        .delay(200)
        .switchMap(() => this.metadataApi.metadataAllClasses('multi'))
        .retryWhen(errors => errors.delay(1000).take(3).concat(Observable.throw(errors)))
    )
      .map(data => this.parseResult(data))
      .do(data => this.cacheService.setItem(TriplestoreLabelService.cacheTriplestoreLabels, data))
      .merge(this.cacheService.getItem(TriplestoreLabelService.cacheTriplestoreLabels))
      .filter(labels => !!labels)
      .share();
  }

  private parseResult(result) {
    this.labels = result[0];
    result[1].results.map(property => {
      this.labels[property['shortName']] = property.label || '';
      this.labels[property['property']] = property.label || '';
    });
    result[2].results.map(data => {
      this.labels[data['class']] = data['label'];
    });
    return this.labels;
  }
}
