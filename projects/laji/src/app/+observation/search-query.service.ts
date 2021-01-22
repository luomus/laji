import { Injectable } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { Subject } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { SearchQueryInterface } from '../shared-modules/search-filters/search-query.interface';

@Injectable({providedIn: 'root'})
export class SearchQueryService implements SearchQueryInterface {
  public queryType = 'observation';
  public queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public query: WarehouseQueryInterface = {};

  private readonly separator = {
    'teamMember': ';'
  };

  private readonly array: Array<keyof WarehouseQueryInterface|'aggregateBy'|'selected'|'orderBy'> = [
    'taxonId',
    'target',
    'effectiveTag',
    'informalTaxonGroupId',
    'informalTaxonGroupIdIncludingReported',
    'administrativeStatusId',
    'redListStatusId',
    'countryId',
    'finnishMunicipalityId',
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
    'orderBy'
  ];

  private readonly boolean: Array<keyof WarehouseQueryInterface|'geoJSON'|'excludeNulls'|'onlyCount'|'pessimisticDateRangeHandling'> = [
    'pessimisticDateRangeHandling',
    'excludeNulls',
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
    'annotated'
  ];

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

  private readonly string: Array<keyof WarehouseQueryInterface|'xValue'|'annotatedBefore'|'annotatedLaterThan'> = [
    'taxonRankId',
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
    'sourceOfCoordinates',
    'formId'
  ];

  private readonly obscure: Array<keyof WarehouseQueryInterface> = [
    'editorPersonToken',
    'observerPersonToken',
    'editorOrObserverPersonToken',
    'editorOrObserverIsNotPersonToken'
  ];

  public static isEmpty(query: WarehouseQueryInterface, key: string) {
    return typeof query[key] === 'undefined' || query[key] === null || query[key] === '';
  }

  constructor(
    private router: Router
  ) {
  }

  public forEachType(opt: {
    skip?: string[],
    cb: (type: 'array'|'boolean'|'numeric'|'string'|'obscure', key: string) => void
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

  public getQueryFromUrlQueryParams(params): WarehouseQueryInterface {
    const result: WarehouseQueryInterface = {};

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

    if (result.coordinates) {
      result.coordinates = result.coordinates.map(coordinate => {
        const parts = coordinate.split(':');
        const last = parseFloat(parts[parts.length - 1]);
        if (!isNaN(last)) {
          parts.pop();
          result._coordinatesIntersection = Math.floor(last * 100);
        } else {
          result._coordinatesIntersection = 100;
        }
        return parts.join(':');
      });
    }
    return result;
  }

  public getQueryObject(query: WarehouseQueryInterface, skipParams: string[] = [], obscure = true) {
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
                .filter(val => typeof val === 'string' && val.trim().length > 0)
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

    return this.getQuery(result, query);
  }

  public getQuery(result, query: WarehouseQueryInterface) {
    if (result.coordinates && typeof query._coordinatesIntersection !== 'undefined') {
      result.coordinates += ':' + query._coordinatesIntersection / 100;
    }

    if (result['target'] && Array.isArray(result['target'])) {
      result['target'] = (result['target'] as string[]).map(target => target.replace(/http:\/\/tun\.fi\//g, ''));
    }

    if (result.editorPersonToken && result.observerPersonToken && result.observerPersonToken === result.editorPersonToken) {
      result.editorOrObserverPersonToken = result.observerPersonToken;
      delete result.editorPersonToken;
      delete result.observerPersonToken;
    }

    return result;
  }

  public getURLSearchParams(dwQuery: WarehouseQueryInterface, queryParameters?: object, skipParams: string[] = []): object {
    if (!queryParameters) {
      queryParameters = {};
    }
    const query = this.getQueryObject(dwQuery, skipParams, false);
    Object.keys(query).map((key) => {
      queryParameters[key] = query[key];
    });

    return queryParameters;
  }

  public updateUrl(query: WarehouseQueryInterface, skipParams: string[]): void {
    const queryParams = this.getQueryObject(query, skipParams);
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
}
