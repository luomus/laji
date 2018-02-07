import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Injectable } from '@angular/core';
import { MetadataApi } from '../api/MetadataApi';
import { Logger } from '../logger/logger.service';
import { MetadataService } from './metadata.service';
import { CacheService } from './cache.service';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';
import { Util } from './util.service';
import { InformalTaxonGroup } from '../model';
import { InformalTaxonGroupApi } from '../api/InformalTaxonGroupApi';

@Injectable()
export class TriplestoreLabelService {

  static cache = {};
  static requestCache = {};

  static readonly cacheProps = 'triplestoreLabels';
  static readonly cacheClasses = 'triplestoreClassLabels';

  private labels;
  private pending: Observable<any>;

  constructor(private metadataApi: MetadataApi,
              private metadataService: MetadataService,
              private logger: Logger,
              private informalTaxonService: InformalTaxonGroupApi,
              private cacheService: CacheService
  ) {
    this.getAllLabels();
  };

  public get(key, lang): Observable<string> {
    return this._get(key, lang)
      .catch(err => {
        this.logger.warn('Failed to fetch label for ' + key, err);
        return Observable.of(key);
      })
  }

  private _get(key, lang): Observable<string> {
    if (TriplestoreLabelService.cache[key]) {
      if (TriplestoreLabelService.requestCache[key]) {
        delete TriplestoreLabelService.requestCache[key];
      }
      return Observable.of(MultiLangService.getValue(TriplestoreLabelService.cache[key], lang));
    }
    const parts = key.split('.');
    switch (parts[0]) {
      case 'MVL':
        if (!TriplestoreLabelService.requestCache[key]) {
          TriplestoreLabelService.requestCache[key] = this.informalTaxonService.informalTaxonGroupFindById(key, 'multi')
            .map((group: InformalTaxonGroup) => group.name)
            .do(name => TriplestoreLabelService.cache[key] = name)
            .map(name => MultiLangService.getValue((name as any), lang))
            .share();
        }
        return TriplestoreLabelService.requestCache[key];
    }

    if (this.labels) {
      return Observable.of(MultiLangService.getValue(this.labels[key], lang));
    } else if (this.pending) {
      return Observable.create((observer: Observer<string>) => {
        this.pending.subscribe(
          (labels) => {
            observer.next(MultiLangService.getValue(labels ? labels[key] : '', lang));
          },
          err => this.logger.warn('Failed to fetch label for ' + key, err),
          () => observer.complete()
        );
      });
    } else {
      return Observable.of(MultiLangService.getValue(this.labels[key], lang));
    }
  }

  private getAllLabels() {
    const cached = (cacheKey, apiCall: Observable<any>) => {
      return this.cacheService.getItem(cacheKey)
        .merge(apiCall
          .do(data => {
            if (!Util.isEmptyObj(data)) {
              this.cacheService.setItem(cacheKey, data)
            }
          })
        )
        .filter(result => {
          return !Util.isEmptyObj(result)
        })
    };

    const fromApi$ = Observable.combineLatest(
      Observable.of('')
        .mergeMap(() => this.metadataService.getAllRangesAsLookUp('multi')),
      Observable.of('')
        .mergeMap(() => cached(
          TriplestoreLabelService.cacheProps,
          this.metadataApi.metadataAllProperties('multi')
            .retryWhen(errors => errors.delay(1000).take(2).concat(Observable.throw(errors)))
            .map(data => {
              const props = {};
              if (data && data.results) {
                data.results.map(property => {
                  props[property['shortName']] = property.label || '';
                  props[property['property']] = property.label || '';
                });
              }

              return props;
            })
        )),
      Observable.of('')
        .mergeMap(() => cached(
          TriplestoreLabelService.cacheClasses,
          this.metadataApi.metadataAllClasses('multi')
            .map(data => {
              const classes = {};
              if (data && data.results) {
                data.results.map(classData => {
                  classes[classData.class] = classData.label;
                });
              }
              return classes;
            })
        ))
    );

    this.pending = fromApi$
      .map(data => this.parseResult(data))
      .share();
  }

  private parseResult(result) {
    if (result.length !== 3 || Util.isEmptyObj(result[0]) || Util.isEmptyObj(result[1]) || Util.isEmptyObj(result[2])) {
      return false;
    }
    this.labels = {...result[0], ...result[1], ...result[2]};

    return this.labels;
  }
}
