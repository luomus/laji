import { Injectable } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { SearchQueryInterface } from '../shared-modules/search-filters/search-query.interface';

@Injectable({providedIn: 'root'})
export class SearchQueryService implements SearchQueryInterface {
  public queryType = 'observation';
  public queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public query: WarehouseQueryInterface = {};

  separator = {
    'teamMember': ';'
  };

  arrayTypes = [
    'taxonId',
    'target',
    'originalTarget',
    'exactTarget',
    'originalExactTarget',
    'informalTaxonGroupId',
    'informalTaxonGroupIdIncludingReported',
    'administrativeStatusId',
    'redListStatusId',
    'countryId',
    'finnishMunicipalityId',
    'biogeographicalProvinceId',
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
    'sex',
    'documentId',
    'gatheringId',
    'unitId',
    'individualId',
    'secureReason',
    'editorId',
    'taxonReliability',
    'annotationType',
    'namedPlaceId',
    'birdAssociationAreaId',
    'yearMonth',
    'reliabilityOfCollection',
    'teamMember',
    'wild',
    'teamMemberId',
    'taxonCensus',
    'primaryHabitat',
    'anyHabitat',
    'aggregateBy',
    'selected',
    'orderBy',
  ];

  booleanTypes = [
    'pessimisticDateRangeHandling',
    'excludeNulls',
    'pairCounts',
    'onlyCount',
    'geoJSON',
    'includeNonValidTaxa',
    'finnish',
    'invasive',
    'typeSpecimen',
    'hasDocumentMedia',
    'hasGatheringMedia',
    'hasUnitMedia',
    'hasMedia',
    'secured',
    'cache',
    'reliable',
    'unidentified',
    'pairCounts',
    'includeSubCollections',
    'nativeOccurrence',
    'breedingSite',
    'useIdentificationAnnotations',
    'includeSubTaxa',
    'annotated'
  ];

  numericTypes = [
    'dayOfYearBegin',
    'dayOfYearEnd',
    'individualCountMin',
    'individualCountMax',
    'coordinateAccuracyMax',
    'page',
    'pageSize'
  ];

  stringTypes = [
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

  obscure = [
    'editorPersonToken',
    'observerPersonToken',
    'editorOrObserverPersonToken'
  ];

  constructor(
    private router: Router
  ) {
  }

  public getQueryFromUrlQueryParams(params): WarehouseQueryInterface {
    const result: WarehouseQueryInterface = {};
    for (const i of this.arrayTypes) {
      if (typeof params[i] !== 'undefined') {
        result[i] = decodeURIComponent(params[i])
          .split(this.separator[i] || ',')
          .map(value => value);
      }
    }

    for (const i of this.booleanTypes) {
      if (typeof params[i] !== 'undefined') {
        result[i] = params[i] === 'true';
      }
    }

    for (const i of this.numericTypes) {
      if (typeof params[i] !== 'undefined') {
        const value = +params[i];
        if (!isNaN(value)) {
          result[i] = value;
        }
      }
    }

    for (const i of [...this.stringTypes, ...this.obscure]) {
      if (typeof params[i] !== 'undefined') {
        result[i] = params[i];
      }
    }

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
    const result: {[field: string]: string | string[]}  = {};
    if (query) {
      for (const i of this.arrayTypes) {
        if (skipParams.indexOf(i) > -1) {
          continue;
        }
        if (query[i] !== undefined) {
          if (query[i].length < 1 || query[0] === '') {
            continue;
          }
          if (typeof query[i] === 'string') {
            query[i] = [query[i]];
          }
          const queries = query[i]
            .filter(val => typeof val === 'string' && val.trim().length > 0)
            .join(this.separator[i] || ',');
          if (queries.length > 0) {
            result[i] = queries;
          }
        }
      }

      for (const i of this.booleanTypes) {
        if (skipParams.indexOf(i) > -1) {
          continue;
        }
        if (query[i] !== undefined) {
          result[i] = query[i] ? 'true' : 'false';
        }
      }

      for (const i of this.numericTypes) {
        if (skipParams.indexOf(i) > -1) {
          continue;
        }
        const type = typeof query[i];
        if (type === 'number' || type === 'string') {
          result[i] = String(query[i]);
        }
      }

      for (const i of this.stringTypes) {
        if (skipParams.indexOf(i) > -1) {
          continue;
        }
        if (query[i] !== undefined && query[i] !== '') {
          result[i] =  query[i];
        }
      }

      for (const i of this.obscure) {
        if (skipParams.indexOf(i) > -1) {
          continue;
        }
        if (query[i] !== undefined) {
          result[i] = obscure ? 'true' : query[i];
        }
      }
    }

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
    const extra = {};
    if (Object.keys(queryParams).length > 0) {
      extra['queryParams'] = queryParams;
    } else {
      extra['preserveQueryParams'] = false;
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
