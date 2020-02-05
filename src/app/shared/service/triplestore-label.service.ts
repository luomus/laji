import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf } from 'rxjs';
import { Injectable } from '@angular/core';
import { Logger } from '../logger/logger.service';
import { CacheService } from './cache.service';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { Taxonomy } from '../model/Taxonomy';
import { InformalTaxonGroupApi } from '../api/InformalTaxonGroupApi';
import { SourceService } from './source.service';
import { UserService } from './user.service';
import { LajiApi, LajiApiService } from './laji-api.service';
import { catchError, map, share, shareReplay, take, tap } from 'rxjs/operators';
import { AreaService } from './area.service';
import { RedListTaxonGroupApi } from '../api/RedListTaxonGroupApi';
import { Publication } from '../model/Publication';
import { NamedPlaceApi } from '../api/NamedPlaceApi';
import { AnnotationService } from '../../shared-modules/document-viewer/service/annotation.service';
import { CollectionService } from './collection.service';
import { BaseDataService, IBaseData } from '../../graph-ql/service/base-data.service';

@Injectable({providedIn: 'root'})
export class TriplestoreLabelService {

  static cache = {};
  static requestCache: any = {};

  private guidRegEx: RegExp;
  private metaData: any;
  private currentLang: string;

  constructor(private logger: Logger,
              private informalTaxonService: InformalTaxonGroupApi,
              private namedPlaceApi: NamedPlaceApi,
              private sourceService: SourceService,
              private cacheService: CacheService,
              private lajiApi: LajiApiService,
              private userService: UserService,
              private areaService: AreaService,
              private annotationService: AnnotationService,
              private redListTaxonGroupApi: RedListTaxonGroupApi,
              private collectionService: CollectionService,
              private baseDataService: BaseDataService
  ) {
    this.guidRegEx = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
  }

  public getAll(keys: string[], lang): Observable<{[key: string]: string}> {
    const set = new Set(keys);
    const subs = [];
    set.forEach(val => {
      subs.push(this.get(val, lang).pipe(map(result => ({key: val, value: result}))));
    });
    return ObservableForkJoin(subs).pipe(
      map((results: any) => results.reduce((cumulative: {[key: string]: string}, current) => {
        if (!cumulative[current.key]) {
          cumulative[current.key] = current.value;
        }
        return cumulative;
      }, {} as {[key: string]: string}))
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
    const parts = key.replace(':', '.').split('.');
    if (parts && typeof parts[1] === 'string' && (!isNaN(parts[1]) || this.guidRegEx.test(parts[1]))) {
      switch (parts[0]) {
        case 'MNP':
          if (typeof TriplestoreLabelService.requestCache[key] === 'undefined') {
            TriplestoreLabelService.requestCache[key] = this.namedPlaceApi.findAll(
              {
                idIn: key,
                userToken: this.userService.getToken(),
                selectedFields: 'name',
                includePublic: true
              },
              '1',
              '1'
              ).pipe(
                map((np) => np.results[0] && np.results[0].name || ''),
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
          return this.userService.getPersonInfo(key);
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
        case 'MMAN':
          if (!TriplestoreLabelService.requestCache[key]) {
            TriplestoreLabelService.requestCache[key] = this.annotationService.getTag(key, 'multi').pipe(
              map(tag => tag.name),
              tap(name => TriplestoreLabelService.cache[key] = name),
              map(name => MultiLangService.getValue((name as any), lang)),
              share()
            );
          }
          return TriplestoreLabelService.requestCache[key];
        case 'gbif-dataset':
        case 'HR':
          return this.collectionService.getName(key, lang).pipe(share());
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
    return this.getAllLabels(lang).pipe(
      map(data => data[key])
    );
  }

  private getAllLabels(lang: string): Observable<{[key: string]: string}> {
    if (this.currentLang !== lang) {
      this.currentLang = lang;
      this.metaData = this.baseDataService.getBaseData().pipe(
          take(1),
          map((data) => this.dataToLookup(data)),
          shareReplay(1)
      );
    }
    return this.metaData;
  }

  private dataToLookup(data: IBaseData) {
    const labelMap = {};
    data.classes.forEach((meta) => {
      labelMap[meta.id] = meta.label;
    });
    data.properties.forEach((meta) => {
      labelMap[meta.id] = meta.label;
    });
    data.alts.forEach((meta) => {
      if (meta.options) {
        meta.options.forEach((option) => {
          labelMap[option.id] = option.label;
        });
      }
    });
    return labelMap;
  }
}
