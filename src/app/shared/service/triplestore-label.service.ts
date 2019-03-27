import { forkJoin as ObservableForkJoin, Observable, Observer, of as ObservableOf } from 'rxjs';
import { Injectable } from '@angular/core';
import { MetadataApi } from '../api/MetadataApi';
import { Logger } from '../logger/logger.service';
import { MetadataService } from './metadata.service';
import { CacheService } from './cache.service';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';
import { Util } from './util.service';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { Taxonomy } from '../model/Taxonomy';
import { InformalTaxonGroupApi } from '../api/InformalTaxonGroupApi';
import { SourceService } from './source.service';
import { UserService } from './user.service';
import { NamedPlacesService } from '../../shared-modules/named-place/named-places.service';
import { NamedPlace } from '../model/NamedPlace';
import { LajiApi, LajiApiService } from './laji-api.service';
import { catchError, filter, map, merge, share, take, tap } from 'rxjs/operators';
import { AreaService } from './area.service';
import { RedListTaxonGroupApi } from '../api/RedListTaxonGroupApi';
import { Publication } from '../model/Publication';
import { NamedPlaceApi } from '../api/NamedPlaceApi';

@Injectable({providedIn: 'root'})
export class TriplestoreLabelService {

  static cache = {};
  static requestCache: any = {};

  static readonly cacheProps = 'triplestoreLabels';
  static readonly cacheClasses = 'triplestoreClassLabels';

  private labels;
  private pending: Observable<any>;

  constructor(private metadataApi: MetadataApi,
              private metadataService: MetadataService,
              private logger: Logger,
              private informalTaxonService: InformalTaxonGroupApi,
              private namedPlaceApi: NamedPlaceApi,
              private sourceService: SourceService,
              private cacheService: CacheService,
              private lajiApi: LajiApiService,
              private userService: UserService,
              private areaService: AreaService,
              private redListTaxonGroupApi: RedListTaxonGroupApi
  ) {
    this.pending = this.getAllLabels();
    this.pending.subscribe();
  }

  public getAll(keys: string[], lang): Observable<{[key: string]: string}> {
    const set = new Set(keys);
    const subs = [];
    set.forEach(val => {
      subs.push(this.get(val, lang).pipe(map(result => ({key: val, value: result}))));
    });
    return ObservableForkJoin(subs).pipe(
      map(results => results.reduce((cumulative, current) => {
        if (!cumulative[current.key]) {
          cumulative[current.key] = current.value;
        }
        return cumulative;
      }, {}))
    );
  }

  public get(key: string, lang: string): Observable<string> {
    if (typeof key !== 'string') {
      return ObservableOf('');
    }
    return this._get(key, lang).pipe(
      catchError(err => {
        this.logger.warn('Failed to fetch label for ' + key, err);
        return ObservableOf(key);
      })
    );
  }

  private _get(key, lang): Observable<string> {
    if (typeof TriplestoreLabelService.cache[key] !== 'undefined') {
      if (TriplestoreLabelService.requestCache[key]) {
        delete TriplestoreLabelService.requestCache[key];
      }
      return ObservableOf(MultiLangService.getValue(TriplestoreLabelService.cache[key], lang));
    }
    const parts = key.split('.');
    if (parts && typeof parts[1] === 'string' && !isNaN(parts[1])) {
      switch (parts[0]) {
        case 'MNP':
          if (typeof TriplestoreLabelService.requestCache[key] === 'undefined') {
            TriplestoreLabelService.requestCache[key] = this.namedPlaceApi.findById(
              key,
              this.userService.getToken(),
              {selectedFields: 'name'}
              ).pipe(
                map((np: NamedPlace) => np.name),
                catchError(() => ObservableOf('')),
                tap(name => TriplestoreLabelService.cache[key] = name),
                share()
              );
          }
          return TriplestoreLabelService.requestCache[key];
        case 'MVL':
          if (!TriplestoreLabelService.requestCache[key]) {
            TriplestoreLabelService.requestCache[key] = this.informalTaxonService.informalTaxonGroupFindById(key, 'multi').pipe(
              catchError(() => this.redListTaxonGroupApi.redListTaxonGroupsFindById(key, 'multi')),
              map((group: InformalTaxonGroup) => group.name),
              tap(name => TriplestoreLabelService.cache[key] = name),
              map(name => MultiLangService.getValue((name as any), lang)),
              share()
            );
          }
          return TriplestoreLabelService.requestCache[key];
        case 'MA':
          if (!TriplestoreLabelService.requestCache[key]) {
            TriplestoreLabelService.requestCache[key] = this.userService.getUser(key).pipe(
              map(person => person.fullName),
              tap(name => TriplestoreLabelService.cache[key] = name),
              share()
            );
          }
          return TriplestoreLabelService.requestCache[key];
        case 'MP':
          if (!TriplestoreLabelService.requestCache[key]) {
            TriplestoreLabelService.requestCache[key] = this.lajiApi.get(LajiApi.Endpoints.publications, key, {lang: 'multi'}).pipe(
              map((publication: Publication) => publication['dc:bibliographicCitation']),
              tap(name => TriplestoreLabelService.cache[key] = name),
              map(name => MultiLangService.getValue((name as any), lang)),
              share()
            );
          }
          return TriplestoreLabelService.requestCache[key];
        case 'ML':
          return this.areaService.getName(key, lang);
        case 'KE':
          return this.sourceService.getName(key, lang);
        case 'MX':
          if (!TriplestoreLabelService.requestCache[key]) {
            TriplestoreLabelService.requestCache[key] = this.lajiApi.get(LajiApi.Endpoints.taxon, key, {lang: 'multi'}).pipe(
              map((taxon: Taxonomy) => taxon.vernacularName || taxon.scientificName),
              tap(name => TriplestoreLabelService.cache[key] = name),
              map(name => MultiLangService.getValue((name as any), lang)),
              share()
            );
          }
          return TriplestoreLabelService.requestCache[key];
      }
    }

    if (this.labels) {
      return ObservableOf(MultiLangService.getValue(this.labels[key] || '', lang));
    } else {
      if (!this.pending) {
        this.pending = this.getAllLabels();
      }
      return Observable.create((observer: Observer<string>) => {
        this.pending.subscribe(
          (labels) => {
            observer.next(MultiLangService.getValue(labels ? labels[key] : '', lang));
          },
          err => this.logger.warn('Failed to fetch label for ' + key, err),
          () => observer.complete()
        );
      });
    }
  }

  private getAllLabels() {
    const cached = (cacheKey, apiCall: Observable<any>) => {
      return this.cacheService.getItem(cacheKey).pipe(
        merge(apiCall.pipe(
            tap(data => {
              if (!Util.isEmptyObj(data)) {
                this.cacheService.setItem(cacheKey, data).subscribe();
              }
            })
          )
        ),
        filter(result => {
          return !Util.isEmptyObj(result);
        })
      );
    };

    const fromApi$ = ObservableForkJoin(
      this.metadataService.getAllRangesAsLookUp('multi').pipe(
        take(1)
      ),
      cached(
        TriplestoreLabelService.cacheProps,
        this.metadataApi.metadataAllProperties('multi').pipe(
          take(1),
          map(data => {
            const props = {};
            if (data && data.results) {
              data.results.map(property => {
                props[property['shortName']] = property.label || '';
                props[property['property']] = property.label || '';
              });
            }
            return props;
          })
        )
      ),
      cached(
        TriplestoreLabelService.cacheClasses,
        this.metadataApi.metadataAllClasses('multi').pipe(
          take(1),
          map(data => {
            const classes = {};
            if (data && data.results) {
              data.results.map(classData => {
                classes[classData.class] = classData.label;
              });
            }
            return classes;
          })
        )
      )
    );

    return fromApi$.pipe(
      map(data => this.parseResult(data)),
      share()
    );
  }

  private parseResult(result) {
    if (result.length !== 3 || Util.isEmptyObj(result[0]) || Util.isEmptyObj(result[1]) || Util.isEmptyObj(result[2])) {
      return false;
    }
    this.labels = {...result[0], ...result[1], ...result[2]};

    return this.labels;
  }
}
