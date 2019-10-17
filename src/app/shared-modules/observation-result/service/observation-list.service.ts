import { concat, delay, map, retryWhen, share, shareReplay, switchMap, take, tap, toArray } from 'rxjs/operators';
import {
  forkJoin as ObservableForkJoin,
  from,
  Observable,
  Observer,
  of as ObservableOf,
  throwError as observableThrowError
} from 'rxjs';
import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { PagedResult } from '../../../shared/model/PagedResult';
import { SourceService } from '../../../shared/service/source.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { IdService } from '../../../shared/service/id.service';
import { Util } from '../../../shared/service/util.service';
import { CoordinatePipe } from '../../../shared/pipe/coordinate.pipe';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { TableColumnService } from '../../datatable/service/table-column.service';
import { ObservationTableColumn } from '../model/observation-table-column';


@Injectable()
export class ObservationListService {

  private key: string;
  private data: Observable<PagedResult<any>>;

  private aggregateKey: string;
  private aggregateData: Observable<PagedResult<any>>;
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
    private sourceService: SourceService,
    private collectionService: CollectionService,
    private triplestoreLabelService: TriplestoreLabelService,
    private tableColumnService: TableColumnService
  ) { }

  getAggregate(
    query: WarehouseQueryInterface,
    aggregateBy: string[],
    page: number,
    pageSize: number,
    orderBy: string[] = [],
    lang: string,
    useStatistics: boolean = false
  ): Observable<PagedResult<any>> {
    const _aggregateBy = this.prepareFields(aggregateBy).filter(val => this.removeAggregateFields.indexOf(val) === -1);
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
        switchMap(data => this.openValues(data, aggregateBy, lang)),
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
    const _selected = this.prepareFields(selected);
    const key = JSON.stringify(query) + [_selected.join(','), orderBy.join(','), lang, page, pageSize].join(':');
    if (this.key !== key) {
      this.key = key;
      this.data = undefined;
    }
    if (!this.data) {
      this.data = this.warehouseApi.warehouseQueryListGet(
        {...query, cache: (query.cache || WarehouseApi.isEmptyQuery(query))},
        [..._selected, 'sample.sampleId', 'unit.unitId', 'document.documentId'],
        orderBy,
        pageSize,
        page
      ).pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), ))).pipe(
        map(data => Util.clone(data))).pipe(
        switchMap(data => this.openValues(data, selected, lang)),
        shareReplay(1)
      );
    }
    return this.data;
  }

  private prepareFields(select: string[]): string[] {
    const exist = {};
    return select.join(',').split(',').reduce((prev, val) => {
      val = ObservationListService.trueFieldPath(val);
      if (!exist[val]) {
        exist[val] = true;
        prev.push(val);
      }
      return prev;
    }, []);
  }

  private convertAggregateResult(data) {
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
            'fi': result.aggregateBy['unit.linkings.taxon.nameFinnish'],
            'en': result.aggregateBy['unit.linkings.taxon.nameEnglish'],
            'sv': result.aggregateBy['unit.linkings.taxon.nameSwedish']
          };
        }
        if (result.aggregateBy['unit.linkings.taxon.speciesNameFinnish']) {
          result.aggregateBy['unit.linkings.taxon.speciesVernacularName'] = {
            'fi': result.aggregateBy['unit.linkings.taxon.speciesNameFinnish'],
            'en': result.aggregateBy['unit.linkings.taxon.speciesNameEnglish'],
            'sv': result.aggregateBy['unit.linkings.taxon.speciesNameSwedish']
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

  private openValues(data, selected: string[], lang: string): Observable<any> {
    const allMappers = [];
    const labels: ObservationTableColumn[] = [];
    const facts: ObservationTableColumn[] = [];

    selected.forEach(col => {
      const column = this.tableColumnService.getColumn(col);
      if (!column) {
        return;
      }
      if (column.fact) {
        column.fact = IdService.getUri(column.fact);
        facts.push(column);
      }
      if (column.cellTemplate === 'label') {
        // TODO: move opening label values here
      }
    });
    /*
    if (selected.indexOf('document.sourceId') > -1) {
      allMappers.push(this.sourceService.getAllAsLookUp(lang).pipe(map(sources => ({'document.sourceId': sources}))));
    }
    if (selected.indexOf('document.collectionId') > -1) {
      allMappers.push(this.collectionService.getAll(lang).pipe(
        map(collections => {
          const lookUp = {};
          collections.map(collection => lookUp[collection.id] = collection.value);
          return lookUp;
        }),
        map(collections => ({'document.collectionId': collections})), ));
    }

    const mappers$ = allMappers.length === 0 ? ObservableOf({}) : ObservableForkJoin(allMappers).pipe(
      map(mappers => mappers.reduce((cumulative, current) => {
        return {...cumulative, ...current};
      }, {})));
    */
    return from(data.results || []).pipe(
      // take(1),
      map(document => this.convertCoordinates(document, selected)),
      map(document => this.addFacts(document, facts)),
      toArray(),
      map(results => ({
        ...data,
        results
      }))
    );
   /*
    return ObservableForkJoin(
      ObservableOf(data),
      mappers$,
      (response, mappers) => {
        response.results = response.results.map(document => {
          if (document.document) {
            if (mappers['document.sourceId'] && document.document.sourceId) {
              if (!uriCache[document.document.sourceId]) {
                uriCache[document.document.sourceId] = IdService.getId(document.document.sourceId);
              }
              const qname = uriCache[document.document.sourceId];
              document.document.source = mappers['document.sourceId'][qname] ?
                mappers['document.sourceId'][qname] : document.document.sourceId;
            }
            if (mappers['document.collectionId'] && document.document.collectionId) {
              if (!uriCache[document.document.collectionId]) {
                uriCache[document.document.collectionId] = IdService.getId(document.document.collectionId);
              }
              const qname = uriCache[document.document.collectionId];
              document.document.collection = mappers['document.collectionId'][qname] ?
                mappers['document.collectionId'][qname] : document.document.collectionId;
            }
          }
          return document;
        });
        return data;
      }
    );
    */
  }

  private stringToObj(path, value, obj) {
    const parts = path.split('.');
    let part;
    while (part = parts.shift()) {
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

  private addFacts(document: object, cols: ObservationTableColumn[]) {
    cols.forEach(col => {
      const paths = ObservationListService.trueFieldPath(col.name).split('.');
      const targetPaths = (col.name).split('.');
      const facts = this.pickFacts(document, paths, col.fact);
      if (facts.length > 0) {
        this.setValue(document, targetPaths, facts);
      }
    });

    return document;
  }

  private setValue(document: object, paths: string[], value: any) {
    const path = paths.shift();
    if (paths.length > 0) {
      if (!document[path]) {
        document[path] = {};
      }
      return this.setValue(document[path], paths, value);
    }
    document[path] = value;
  }

  private pickFacts(document: object, paths: string[], fact: string): string[] {
    const path = paths.shift();
    if (paths.length > 0) {
      return document[path] ? this.pickFacts(document[path], paths, fact) : [];
    }
    if (Array.isArray(document[path])) {
      return document[path].reduce((prev, doc) => {
        if (doc.fact === fact) {
          prev.push(doc.value);
        }
        return prev;
      }, []);
    }
    return [];
  }
}
