import { Injectable } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { Subject } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { SearchQueryInterface } from '../shared-modules/search-filters/search-query.interface';
import * as Util from '../shared/utils';

interface WarehouseSearchQuery extends WarehouseQueryInterface {
  [extraKey: string]: any;
}

@Injectable({providedIn: 'root'})
export class SearchQueryService implements SearchQueryInterface {
  public queryType = 'observation';
  public queryUpdatedSource = new Subject<any>();
  public searchUpdated$ = this.queryUpdatedSource.asObservable();

  public query = {};
  public filters = {};

  private readonly separator: Record<string, string> = {
    teamMember: ';',
    anyHabitat: ';',
    primaryHabitat: ';',
  };

  // noinspection JSUnusedLocalSymbols
  private readonly array: Array<keyof WarehouseQueryInterface|'aggregateBy'|'selected'|'orderBy'> = [
    'taxonId',
    'target',
    'effectiveTag',
    'informalTaxonGroupId',
    'informalTaxonGroupIdNot',
    'informalTaxonGroupIdIncludingReported',
    'administrativeStatusId',
    'redListStatusId',
    'countryId',
    'finnishMunicipalityId',
    'provinceId',
    'elyCentreId',
    'biogeographicalProvinceId',
    'wgs84CenterPoint',
    'area',
    'time',
    'keyword',
    'collectionId',
    'collectionIdNot',
    'typeOfOccurrenceId',
    'typeOfOccurrenceIdNot',
    'coordinates',
    'sourceId',
    'secureLevel',
    'superRecordBasis',
    'recordBasis',
    'lifeStage',
    'formId',
    'invasiveControl',
    'sex',
    'documentId',
    'documentFact',
    'gatheringFact',
    'unitFact',
    'gatheringId',
    'unitId',
    'individualId',
    'secureReason',
    'editorId',
    'recordQuality',
    'reliability',
    'completeListType',
    'annotationType',
    'namedPlaceId',
    'birdAssociationAreaId',
    'yearMonth',
    'collectionQuality',
    'teamMember',
    'wild',
    'teamMemberId',
    'taxonCensus',
    'primaryHabitat',
    'anyHabitat',
    'sampleId',
    'sampleFact',
    'sampleType',
    'sampleQuality',
    'sampleStatus',
    'sampleMaterial',
    'sampleCollectionId',
    'aggregateBy',
    'selected',
    'orderBy',
    'plantStatusCode',
    'sourceOfCoordinates',
    'atlasCode',
    'atlasClass',
    'identificationBasis',
    'samplingMethod',
    'taxonRankId',
    'hasValue'
  ];

  // noinspection JSUnusedLocalSymbols
  private readonly boolean: Array<keyof WarehouseQueryInterface|'geoJSON'|'excludeNulls'|'onlyCount'|'pessimisticDateRangeHandling'> = [
    'pessimisticDateRangeHandling',
    'excludeNulls',
    'taxonCounts',
    'gatheringCounts',
    'pairCounts',
    'onlyCount',
    'geoJSON',
    'includeNonValidTaxa',
    'invasiveControlled',
    'finnish',
    'invasive',
    'sampleMultiple',
    'typeSpecimen',
    'hasDocumentMedia',
    'hasGatheringMedia',
    'hasUnitMedia',
    'hasUnitImages',
    'hasUnitAudio',
    'hasUnitModel',
    'hasMedia',
    'hasSample',
    'secured',
    'cache',
    'reliable',
    'unidentified',
    'needsCheck',
    'pairCounts',
    'includeSubCollections',
    'nativeOccurrence',
    'breedingSite',
    'useIdentificationAnnotations',
    'includeSubTaxa',
    'annotated',
    'onlyNonStateLands',
    'local',
    'alive',
    'higherTaxon',
    'sensitive',
    'hasSequenceText'
  ];

  // noinspection JSUnusedLocalSymbols
  private readonly numeric: Array<keyof WarehouseQueryInterface|'page'|'pageSize'> = [
    'dayOfYearBegin',
    'dayOfYearEnd',
    'individualCountMin',
    'individualCountMax',
    'occurrenceCountFinlandMax',
    'coordinateAccuracyMax',
    'page',
    'pageSize'
  ];

  // noinspection JSUnusedLocalSymbols
  private readonly string: Array<keyof WarehouseQueryInterface|'xValue'|'annotatedBefore'|'annotatedLaterThan'> = [
    'xValue',
    'ykj10kmCenter',
    'qualityIssues',
    'annotatedBefore',
    'annotatedLaterThan',
    'firstLoadedSameOrBefore',
    'firstLoadedSameOrAfter',
    'annotatedSameOrBefore',
    'annotatedSameOrAfter',
    'loadedSameOrBefore',
    'loadedSameOrAfter',
    'season',
    'formId',
    'taxonAdminFiltersOperator',
    'collectionAndRecordQuality',
    'featureType',
    'polygonId'
  ];

  // noinspection JSUnusedLocalSymbols
  private readonly obscure: Array<keyof WarehouseQueryInterface> = [
    'editorPersonToken',
    'observerPersonToken',
    'editorOrObserverPersonToken',
    'editorOrObserverIsNotPersonToken'
  ];

  public static isEmpty(query: WarehouseSearchQuery, key: string) {
    return typeof query[key] === 'undefined' || query[key] === null || query[key] === '';
  }

  constructor(
    private router: Router
  ) {
  }

  public forEachType(opt: {
    skip?: string[];
    cb: (type: 'array'|'boolean'|'numeric'|'string'|'obscure', key: string) => void;
  }) {
    const types: Array<'array'|'boolean'|'numeric'|'string'|'obscure'> = ['array', 'boolean', 'numeric', 'string', 'obscure'];
    types.forEach(type => {
      for (const key of this[type]) {
        if (opt.skip && opt.skip.includes(key)) {
          continue;
        }
        opt.cb(type, key);
      }
    });
  }

  public getQueryFromUrlQueryParams(params: Record<string, any>): WarehouseQueryInterface {
    const result: WarehouseSearchQuery = {};

    this.forEachType({cb: (type, key) => {
      if (typeof params[key] === 'undefined') {
        return;
      }
      switch (type) {
        case 'array':
          result[key] = decodeURIComponent(params[key])
            .split(this.separator[key] || ',');
          break;
        case 'boolean':
          result[key] = params[key] === 'true';
          break;
        case 'numeric':
          const value = +params[key];
          if (!isNaN(value)) {
            result[key] = value;
          }
          break;
        default:
          result[key] = params[key];
      }
    }});

    const detachCoordinatesIntersection = (query: string): [string, number | undefined] => {
      const parts = query.split(':');
      const last = parseFloat(parts[parts.length - 1]);
      let coordinatesIntersection: number | undefined;
      if (parts.length > 1 && !isNaN(last)) {
        parts.pop();
        coordinatesIntersection = Math.floor(last * 100);
      }
      return [parts.join(':'), coordinatesIntersection];
    };

    if (result.coordinates) {
      result.coordinates = result.coordinates.map(coordinate => {
        const [withoutCoordinatesIntersection, coordinatesIntersection] = detachCoordinatesIntersection(coordinate);
        result._coordinatesIntersection = coordinatesIntersection
          ?? (coordinate.match(/YKJ/)
            ? 100
            : 0);
        return withoutCoordinatesIntersection;
      });
    }
    return result;
  }

  private getNormalizedRouterQuery(query: WarehouseSearchQuery, skipParams: string[] = [], obscure = true) {
    const result: {[field: string]: string | string[]}  = {};
    if (query) {
      this.forEachType({
        skip: skipParams,
        cb: (type, key) => {
          if (SearchQueryService.isEmpty(query, key)) {
            return;
          }
          switch (type) {
            case 'array':
              if (query[key].length < 1 || query[0] === '') {
                return;
              }
              if (typeof query[key] === 'string') {
                query[key] = [query[key]];
              }
              const queries = query[key]
                .filter((val: any) => typeof val === 'string' && val.trim().length > 0)
                .join(this.separator[key] || ',');
              if (queries.length > 0) {
                result[key] = queries;
              }
              break;
            case 'boolean':
              result[key] = query[key] ? 'true' : 'false';
              break;
            case 'numeric':
              result[key] = String(query[key]);
              break;
            case 'string':
              if (query[key] !== '') {
                result[key] =  query[key];
              }
              break;
            case 'obscure':
              result[key] = (obscure ? 'true' : query[key]) as any;
              break;
        }
      }});
    }

    return this.normalizeQueryForInternalURL(result, query);
  }

  /**
   * Provided just in case for compatibility with observation-download.
   * For some reason it uses an object with string values for an API call (I.e. an URL/router sorta query),
   * I played it safe and kept it as is, but that component should be refactored sometime.
   */
  public prepareDownloadApiQueryObject(
    query: WarehouseSearchQuery,
    skipParams: string[] = [],
    obscure = true
  ) {
    return this.getNormalizedRouterQuery(query, skipParams, obscure);
  }

  public prepareRouterQueryObject(
    query: WarehouseSearchQuery,
    skipParams: string[] = ['selected', 'pageSize', 'page']
  ) {
    return this.getNormalizedRouterQuery(query, skipParams, true);
  }

  private prepareInternalFields<T extends WarehouseQueryInterface>(internalQuery: T) {
    if (Array.isArray(internalQuery.target)) {
      internalQuery.target = internalQuery.target.map(target => target.replace(/http:\/\/tun\.fi\//g, ''));
    }

    if (
      (internalQuery.editorOrObserverPersonToken && (internalQuery.editorPersonToken || internalQuery.observerPersonToken))
      || internalQuery.editorOrObserverIsNotPersonToken
    ) {
      delete internalQuery.editorOrObserverPersonToken;
    } else if (
      internalQuery.editorPersonToken
      && internalQuery.observerPersonToken
      && internalQuery.observerPersonToken === internalQuery.editorPersonToken
    ) {
      internalQuery.editorOrObserverPersonToken = internalQuery.observerPersonToken;
      delete internalQuery.editorPersonToken;
      delete internalQuery.observerPersonToken;
    }

    delete internalQuery._coordinatesIntersection;

    return internalQuery;
  }

  /**
   * Mutates `result` to prepare internal query model into internal router query params
   */
  public normalizeQueryForInternalURL(result: any, query: WarehouseQueryInterface) {
    ['coordinates'].forEach(key => {
      const last = (query as any)[key]?.[0]?.split(':').pop();
      if (result[key] && typeof query._coordinatesIntersection !== 'undefined' && last !== undefined && isNaN(last)) {
        result[key] += ':' + query._coordinatesIntersection / 100;
      }
    });

    this.prepareInternalFields(result);

    return result;
  }

  /**
   * Takes an internal observation search query object and returns a new query object that is ready for API calls
   */
  public getNormalizedApiQuery<T extends WarehouseQueryInterface>(internalQuery: T): T {
    const result = { ...internalQuery };

    if (Array.isArray(result.coordinates) && typeof internalQuery._coordinatesIntersection !== 'undefined') {
      result.coordinates = result.coordinates.map((coordinate) => {
        const last = coordinate.split(':').pop();
        return last !== undefined && isNaN(parseFloat(last))
          ? `${coordinate}:${internalQuery._coordinatesIntersection! / 100}`
          : coordinate;
      });
    }

    this.prepareInternalFields(result);

    return result;
  }

  public getURLSearchParams(dwQuery: WarehouseQueryInterface, queryParameters?: Record<string, unknown>, skipParams: string[] = []): Record<string, unknown> {
    if (!queryParameters) {
      queryParameters = {};
    }
    const query = this.prepareDownloadApiQueryObject(dwQuery, skipParams, false);
    Object.keys(query).map((key) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      queryParameters![key] = query[key];
    });

    return queryParameters;
  }

  public updateUrl(query: WarehouseQueryInterface, skipParams: string[]): void {
    const queryParams = this.prepareRouterQueryObject(query, skipParams);
    const extra: NavigationExtras = {};
    if (Object.keys(queryParams).length > 0) {
      extra['queryParams'] = queryParams;
    }
    this.router.navigate(
      [],
      extra
    );
  }

  public queryUpdate(data = {}): void {
    this.queryUpdatedSource.next(data);
  }

  public static hasValue(value?: boolean|number|string|string[]): boolean {
    const type = typeof value;
    if (type === 'undefined') {
      return false;
    } else if (type === 'boolean' || type === 'number') {
      return true;
    }
    value = value as string|string[];
    return value?.length > 0;
  }

  public static getDifferenceBetweenQueries(query1: WarehouseQueryInterface, query2: WarehouseQueryInterface): WarehouseQueryInterface {
    const query1Keys = Object.keys(query1) as (keyof WarehouseQueryInterface)[];
    const query2Keys = Object.keys(query2) as (keyof WarehouseQueryInterface)[];
    const uniqueKeys = Array.from(new Set(query1Keys.concat(query2Keys)));

    return uniqueKeys.reduce((changed: WarehouseQueryInterface, key: keyof WarehouseQueryInterface) => {
      const value1 = query1[key];
      const value2 = query2[key];

      if (SearchQueryService.hasValue(value1) || SearchQueryService.hasValue(value2)) {
        const areArrays = Array.isArray(value1) && Array.isArray(value2);
        if (!(value1 === value2 || (areArrays && Util.equalsArray(value1, value2)))) {
          (changed as any)[key] = query2[key];
        }
      }

      return changed;
    }, {});
  }

  public static queriesHaveDifferences(query1: WarehouseQueryInterface, query2: WarehouseQueryInterface): boolean {
    const differences = SearchQueryService.getDifferenceBetweenQueries(query1, query2);
    return Object.keys(differences).length > 0;
  }
}
