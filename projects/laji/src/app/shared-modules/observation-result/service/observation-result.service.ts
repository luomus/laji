import {
  catchError,
  concat,
  concatMap,
  delay,
  map,
  retryWhen,
  shareReplay,
  switchMap,
  take,
  toArray
} from 'rxjs/operators';
import {
  from,
  Observable, of,
  throwError as observableThrowError
} from 'rxjs';
import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { PagedResult } from '../../../shared/model/PagedResult';
import { IdService } from '../../../shared/service/id.service';
import { Util } from '../../../shared/service/util.service';
import { CoordinatePipe } from '../../../shared/pipe/coordinate.pipe';
import { TableColumnService } from '../../datatable/service/table-column.service';
import { ObservationTableColumn } from '../model/observation-table-column';
import { DatatableUtil } from '../../datatable/service/datatable-util.service';
import { IColumns } from '../../datatable/service/observation-table-column.service';
import { UserService } from '../../../shared/service/user.service';

interface IInternalObservationTableColumn extends ObservationTableColumn {
  _paths: string[];
}

@Injectable()
export class ObservationResultService {

  public idFields = ['unit.unitId', 'document.documentId'];

  private key?: string;
  private data?: Observable<PagedResult<any>>;

  private aggregateKey?: string;
  private aggregateData?: Observable<PagedResult<any>>;
  private removeAggregateFields =  ['oldestRecord', 'newestRecord', 'count', 'individualCountMax', 'individualCountSum', 'pairCount'];
  private coordinatePipe = new CoordinatePipe();

  private static trueFieldPath(field: string) {
    const factPos = field.indexOf('.facts.');
    if (factPos > -1) {
      field = field.substr(0, factPos + 6);
    }
    return field;
  }

  constructor(
    private warehouseApi: WarehouseApi,
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>,
    private datatableUtil: DatatableUtil,
    private userService: UserService
  ) { }

  getAggregate(
    query: WarehouseQueryInterface,
    aggregateBy: string[],
    page: number,
    pageSize: number,
    orderBy: string[] = [],
    lang: string,
    useStatistics: boolean = false,
    showFacts: boolean = false
  ): Observable<PagedResult<any>> {
    const _aggregateBy = this.prepareFields(aggregateBy, !showFacts).filter(val => this.removeAggregateFields.indexOf(val) === -1);
    const key = JSON.stringify(query) + [_aggregateBy.join(','), orderBy.join(','), lang, page, pageSize, useStatistics].join(':');
    if (this.aggregateKey !== key && this.aggregateData) {
      this.aggregateKey = key;
      this.aggregateData = undefined;
    }

    if (!this.aggregateData) {
      const method = useStatistics
        ? this.warehouseApi.warehouseQueryStatisticsGet
        : this.warehouseApi.warehouseQueryAggregateGet;

      this.aggregateData = method(
        {...query, cache: (query.cache || WarehouseApi.isEmptyQuery(query))},
        [..._aggregateBy],
        orderBy,
        pageSize,
        page,
        false,
        false
      ).pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), ))).pipe(
        map(data => Util.clone(data)),
        map(data => this.convertAggregateResult(data))).pipe(
        switchMap(data => this.openValues(data, aggregateBy)),
        shareReplay(1)
      );
    }
    return this.aggregateData;
  }

  getList(
    query: WarehouseQueryInterface,
    selected: string[],
    page: number,
    pageSize: number,
    orderBy: string[] = [],
    lang: string
  ): Observable<PagedResult<any>> {
    const key = JSON.stringify(query) + [this.prepareFields(selected, false).join(','), orderBy.join(','), lang, page, pageSize].join(':');
    if (this.key !== key) {
      this.key = key;
      this.data = undefined;
    }
    if (!this.data) {
      this.data = this.warehouseApi.warehouseQueryListGet(
        {...query, cache: (query.cache || WarehouseApi.isEmptyQuery(query))},
        [...this.prepareFields(selected), ...this.idFields],
        orderBy,
        pageSize,
        page
      ).pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), ))).pipe(
        map(data => Util.clone(data))).pipe(
        switchMap(data => this.openValues(data, selected)),
        shareReplay(1)
      );
    }
    return this.data;
  }

  getAll(
    query: WarehouseQueryInterface,
    selected: string[],
    orderBy: string[],
    lang: string,
    sendDownloadMark = false,
    blockOnDownloadMarkFail = false,
    reason = ''
  ): Observable<{id: string | null; results: any[]}> {

    const all$ = this._getAll(
      query,
      selected,
      orderBy,
      lang
    );

    if (sendDownloadMark) {
      if (blockOnDownloadMarkFail) {
        return this.sendDownloadMark(query, lang, reason).pipe(
          switchMap((download) => all$.pipe(
            map(all => ({
              id: IdService.getId(download.id),
              results: all
            }))
          ))
        );
      }
      this.sendDownloadMark(query, lang, reason).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
    return all$.pipe(map(all => ({id: null, results: all})));
  }

  private sendDownloadMark(query: WarehouseQueryInterface, lang: string, reason: string): Observable<any> {
    return this.warehouseApi.download(
      this.userService.getToken(),
      '',
      '',
      query,
      lang,
      'LIGHTWEIGHT',
      {
        dataUsePurpose: reason
      }
    );
  }

  private _getAll(
    query: WarehouseQueryInterface,
    selected: string[],
    orderBy: string[],
    lang: string,
    data: any[] = [],
    page = 1,
    pageSize = 1000
  ): Observable<any> {
    return this.getList(query, selected, page, pageSize, orderBy, lang).pipe(
      switchMap(result => {
        data.push(...result.results);
        if (result.lastPage > result.currentPage) {
          return this._getAll(query, selected, orderBy, lang, data, result.currentPage + 1);
        } else {
          return of(data);
        }
      })
    );
  }

  private prepareFields(select: string[], useTrueFieldPath = true): string[] {
    const exist: Record<string, boolean> = {};
    return select.join(',').split(',').reduce((prev, val) => {
      if (useTrueFieldPath) {
        val = ObservationResultService.trueFieldPath(val);
      }
      if (!exist[val]) {
        exist[val] = true;
        prev.push(val);
      }
      return prev;
    }, [] as string[]);
  }

  private convertAggregateResult(data: { results: any[] }) {
    data.results = data.results.map(result => {
      const aggregate = {
        count: result.count,
        individualCountSum: result.individualCountSum,
        individualCountMax: result.individualCountMax,
        oldestRecord: result.oldestRecord,
        newestRecord: result.newestRecord,
        pairCountSum: result.pairCountSum,
      };
      if (result.aggregateBy) {
        if (result.aggregateBy['unit.linkings.taxon.nameFinnish']) {
          result.aggregateBy['unit.linkings.taxon.vernacularName'] = {
            fi: result.aggregateBy['unit.linkings.taxon.nameFinnish'],
            en: result.aggregateBy['unit.linkings.taxon.nameEnglish'],
            sv: result.aggregateBy['unit.linkings.taxon.nameSwedish']
          };
        }
        if (result.aggregateBy['unit.linkings.taxon.speciesNameFinnish']) {
          result.aggregateBy['unit.linkings.taxon.speciesVernacularName'] = {
            fi: result.aggregateBy['unit.linkings.taxon.speciesNameFinnish'],
            en: result.aggregateBy['unit.linkings.taxon.speciesNameEnglish'],
            sv: result.aggregateBy['unit.linkings.taxon.speciesNameSwedish']
          };
        }
        Object.keys(result.aggregateBy).map(key => {
          this.stringToObj(key, result.aggregateBy[key], aggregate);
        });
      }
      return aggregate;
    });
    return data;
  }

  private openValues(data: { results: any[] }, selected: string[]): Observable<any> {
    const transform: IInternalObservationTableColumn[] = [];
    const facts: ObservationTableColumn[] = [];

    selected.forEach(col => {
      const column = this.tableColumnService.getColumn(col);
      if (!column) {
        return;
      }
      if (column.fact) {
        facts.push(column);
      }
      if (column.transform) {
        transform.push({...column, _paths: ('' + (column.prop || column.name)).split('.')});
      }
    });

    return from(data.results || []).pipe(
      map(document => this.convertCoordinates(document, selected)),
      map(document => this.addFacts(document, facts)),
      concatMap(document => this.transformDocument(document, transform)),
      toArray(),
      map(results => ({
        ...data,
        results
      }))
    );
  }

  private stringToObj(path: string, value: any, obj: any) {
    const parts = path.split('.');
    let part;
    while (true) {
      part = parts.shift();
      if (!part) {
        break;
      }
      if (typeof obj[part] !== 'object') {
        obj[part] = {};
      }
      if (parts.length === 0) {
        obj[part] = value;
      }
      obj = obj[part];
    }
  }


  private convertCoordinates(document: any, selected: string[]) {
    if (document && document.gathering && document.gathering.conversions) {
      ['ykj', 'euref', 'wgs84', 'ykj10km', 'ykj10kmCenter', 'ykj1km', 'ykj1kmCenter'].forEach(type => {
        if (selected.indexOf(`gathering.conversions.${type}`) && document.gathering.conversions[type]) {
          document.gathering.conversions[type].verbatim =
            this.coordinatePipe.transform(document.gathering.conversions[type], type);
        }
      });
    }
    return document;
  }

  private addFacts(document: any, cols: ObservationTableColumn[]) {
    cols.forEach(col => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const paths = ObservationResultService.trueFieldPath(col.name!).split('.');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const targetPaths = (col.name!).split('.');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const facts = this.pickFacts(document, paths, col.fact!);
      if (facts.length > 0) {
        this.setValue(document, targetPaths, facts);
      }
    });

    return document;
  }

  private getValue(document: any, paths: string[]) {
    let pointer = document;
    paths.forEach(path => {
      if (pointer) {
        pointer = pointer[path];
      }
    });
    return pointer;
  }

  private setValue(document: any, paths: string[], value: any) {
    let pointer = document;
    let key = paths[0];
    for (let i = 0; i < paths.length - 1; i++) {
      if (!pointer[key]) {
        pointer[key] = {};
      }
      pointer = pointer[key];
      key = paths[i + 1];
    }
    pointer[key] = value;
  }

  private pickFacts(document: any, paths: string[], fact: string): string[] {
    const facts = this.getValue(document, paths);
    if (!Array.isArray(facts) || fact.length === 0) {
      return [];
    }
    return facts.reduce((prev, doc) => {
      if (doc.fact === fact) {
        prev.push(doc.value);
      }
      return prev;
    }, []);
  }

  private transformDocument(document: any, transforms: IInternalObservationTableColumn[]): Observable<any> {
    return from(transforms).pipe(
      concatMap(transform => this.transformField(this.getValue(document, transform._paths), transform).pipe(
        map(value => this.setValue(document, transform._paths, value))
      )),
      toArray(),
      map(() => document)
    );
  }

  private transformField(value: any, transforms: IInternalObservationTableColumn): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.datatableUtil.getVisibleValue(value, null, transforms.transform!);
  }
}
