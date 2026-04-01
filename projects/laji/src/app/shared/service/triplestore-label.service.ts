import { forkJoin as ObservableForkJoin, Observable, of, catchError, map, share, take, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';
import { SourceService } from './source.service';
import { UserService } from './user.service';
import { AreaService } from './area.service';
import { AnnotationService } from '../../shared-modules/document-viewer/service/annotation.service';
import { CollectionService } from './collection.service';
import { BaseDataService } from '../../graph-ql/service/base-data.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type Taxon = components['schemas']['LajiBackendTaxon'];
type TaxonGroup = components['schemas']['store-informalTaxonGroup'] | components['schemas']['store-iucnRedListTaxonGroup'];
type Publication = components['schemas']['store-publication'];

@Injectable({providedIn: 'root'})
export class TriplestoreLabelService {

  static cache: any = {};
  static requestCache: any = {};

  private guidRegEx: RegExp;

  constructor(private api: LajiApiClientBService,
              private sourceService: SourceService,
              private userService: UserService,
              private areaService: AreaService,
              private annotationService: AnnotationService,
              private collectionService: CollectionService,
              private baseDataService: BaseDataService
  ) {
    this.guidRegEx = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/gi;
  }

  public getAll(keys: string[], lang: string): Observable<{[key: string]: string}> {
    const set = new Set(keys);
    const subs: Observable<{key: string; value: string}>[] = [];
    set.forEach(val => {
      subs.push(this.get(val, lang).pipe(map(result => ({key: val, value: result}))));
    });
    return ObservableForkJoin(subs).pipe(
      map((results: any) => results.reduce((cumulative: {[key: string]: string}, current: any) => {
        if (!cumulative[current.key]) {
          cumulative[current.key] = current.value;
        }
        return cumulative;
      }, {} as {[key: string]: string}))
    );
  }

  public get(key: string, lang: string): Observable<string> {
    return typeof key === 'string' ?
      this._get(key, lang).pipe(catchError(() => of(key))) :
      of('');
  }

  private _get(key: string, lang: string): Observable<string> {
    if (typeof TriplestoreLabelService.cache[key] !== 'undefined') {
      if (TriplestoreLabelService.requestCache[key]) {
        delete TriplestoreLabelService.requestCache[key];
      }
      return of(MultiLangService.getValue(TriplestoreLabelService.cache[key], lang));
    }
    const parts = key.replace(':', '.').split('.');
    if (parts && typeof parts[1] === 'string' && (/^\d+$/.test(parts[1]) || this.guidRegEx.test(parts[1]))) {
      switch (parts[0]) {
        case 'MNP':
          if (typeof TriplestoreLabelService.requestCache[key] === 'undefined') {
            TriplestoreLabelService.requestCache[key] = this.api.get('/named-places', {
              query: {
                idIn: key,
                selectedFields: 'name',
                includePublic: true,
                page: 1,
                pageSize: 1
              }
            }).pipe(
                map((np) => np.results[0] && np.results[0].name || ''),
                catchError(() => of('')),
                tap(name => TriplestoreLabelService.cache[key] = name),
                share()
              );
          }
          return TriplestoreLabelService.requestCache[key];
        case 'MVL':
          if (!TriplestoreLabelService.requestCache[key]) {
            TriplestoreLabelService.requestCache[key] = this.api.get('/informal-taxon-groups/{id}', { path: { id: key } }).pipe(
              catchError(() => this.api.get('/red-list-evaluation-groups/{id}', { path: { id: key } })),
              map((group: TaxonGroup) => group.name),
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
            TriplestoreLabelService.requestCache[key] = this.api.get('/publications/{id}', { path: { id: key } }).pipe(
              map((publication: Publication) => publication.name || ''),
              tap(name => TriplestoreLabelService.cache[key] = name),
              map(name => MultiLangService.getValue((name as any), lang)),
              share()
            );
          }
          return TriplestoreLabelService.requestCache[key];
        case 'ML':
          return this.areaService.getName(key);
        case 'KE':
          return this.sourceService.getName(key, lang);
        case 'MMAN':
          if (!TriplestoreLabelService.requestCache[key]) {
            TriplestoreLabelService.requestCache[key] = this.annotationService.getTag(key).pipe(
              map(tag => tag.name),
              tap(name => TriplestoreLabelService.cache[key] = name),
              share()
            );
          }
          return TriplestoreLabelService.requestCache[key];
        case 'gbif-dataset':
        case 'HR':
          return this.collectionService.getName$(key, lang).pipe(share());
        case 'MX':
          if (!TriplestoreLabelService.requestCache[key]) {
            TriplestoreLabelService.requestCache[key] = this.api.get('/taxa/{id}', { path: { id: key } }).pipe(
              map((taxon: Taxon) => taxon.vernacularName || taxon.scientificName),
              tap(name => TriplestoreLabelService.cache[key] = name),
              map(name => MultiLangService.getValue((name as any), lang)),
              share()
            );
          }
          return TriplestoreLabelService.requestCache[key];
      }
    }
    return this.getAllLabels().pipe(
      map(data => data[key])
    );
  }

  private getAllLabels(): Observable<{[key: string]: string}> {
    return this.baseDataService.getLabelMap().pipe(take(1));
  }
}
