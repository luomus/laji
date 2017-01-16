import { Injectable, Inject } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { URLSearchParams } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Injectable()
export class SearchQuery {

  public queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();
  public tack: number = 0;

  public query: WarehouseQueryInterface = {};
  public page: number;
  public pageSize: number = 20;
  public includeNonValidTaxa: boolean = false;
  public selected: string[];
  public orderBy: string[];
  public aggregateBy: string[];

  arrayTypes = [
    'taxonId',
    'target',
    'informalTaxonGroupId',
    'administrativeStatusId',
    'redListStatusId',
    'countryId',
    'finnishMunicipalityId',
    'biogeographicalProvinceId',
    'area',
    'time',
    'keyword',
    'collectionId',
    'coordinates',
    'sourceId',
    'superRecordBasis',
    'recordBasis',
    'lifeStage',
    'sex',
    'documentId',
    'unitId',
    'individualId',
    'secureReason',
    'editorId'
  ];

  booleanTypes = [
    'includeNonValidTaxa',
    'finnish',
    'invasive',
    'typeSpecimen',
    'hasDocumentMedia',
    'hasGatheringMedia',
    'hasUnitMedia',
    'hasMedia'
  ];

  numericTypes = [
    'dayOfYearBegin',
    'dayOfYearEnd',
    'individualCountMin',
    'individualCountMax',
    'coordinateAccuracyMax'
  ];

  stringTypes = [
    'taxonRankId'
  ];

  constructor(private router: Router) {
  }

  public setQueryFromQueryObject(query) {
    for (let i of this.arrayTypes) {
      if (typeof query[i] !== 'undefined') {
        this.query[i] = decodeURIComponent(query[i])
          .split(',')
          .map(value => value);
      } else {
        this.query[i] = undefined;
      }
    }

    for (let i of this.booleanTypes) {
      if (typeof query[i] !== 'undefined') {
        this.query[i] = query[i] === 'true';
      } else {
        this.query[i] = undefined;
      }
    }

    for (let i of this.numericTypes) {
      if (typeof query[i] !== 'undefined') {
        let value = +query[i];
        if (!isNaN(value)) {
          this.query[i] = value;
        }
      } else {
        this.query[i] = undefined;
      }
    }

    for (let i of this.stringTypes) {
      if (typeof query[i] !== 'undefined') {
        this.query[i] = query[i];
      } else {
        this.query[i] = undefined;
      }
    }

    if (typeof query['page'] !== 'undefined') {
      this.page = +query['page'];
    }
  }

  public setQueryFromURLSearchParams(queryParameters: URLSearchParams) {
    for (let i of this.arrayTypes) {
      if (queryParameters.has(i)) {
        this.query[i] = decodeURIComponent(queryParameters.get(i))
          .split(',')
          .map(value => value);
      } else {
        this.query[i] = undefined;
      }
    }

    for (let i of this.booleanTypes) {
      if (queryParameters.has(i)) {
        this.query[i] = queryParameters.get(i) === 'true';
      } else {
        this.query[i] = undefined;
      }
    }

    for (let i of this.numericTypes) {
      if (queryParameters.has(i)) {
        let value = +queryParameters.get(i);
        if (!isNaN(value)) {
          this.query[i] = value;
        }
      } else {
        this.query[i] = undefined;
      }
    }

    for (let i of this.stringTypes) {
      if (queryParameters.has(i)) {
        this.query[i] = queryParameters.get(i);
      } else {
        this.query[i] = undefined;
      }
    }

    if (queryParameters.has('page')) {
      this.page = +queryParameters.get('page');
    }
  }

  public getQueryObject(skipParams: string[] = []) {
    let result = {};
    for (let i of this.arrayTypes) {
      if (skipParams.indexOf(i) > -1) {
        continue;
      }
      if (this.query[i] !== undefined) {
        if (this.query[i].length < 1 || this.query[0] === '') {
          continue;
        }
        if (typeof this.query[i] === 'string') {
          this.query[i] = [this.query[i]];
        }
        let query = this.query[i]
          .filter(val => val.trim().length > 0)
          .join(',');
        if (query.length > 0) {
          result[i] = query;
        }
      }
    }

    for (let i of this.booleanTypes) {
      if (skipParams.indexOf(i) > -1) {
        continue;
      }
      if (this.query[i] !== undefined) {
        result[i] = this.query[i] ? 'true' : 'false';
      }
    }

    for (let i of this.numericTypes) {
      if (skipParams.indexOf(i) > -1) {
        continue;
      }
      let type = typeof this.query[i];
      if (type === 'number' || type === 'string') {
        result[i] = String(this.query[i]);
      }
    }

    for (let i of this.stringTypes) {
      if (skipParams.indexOf(i) > -1) {
        continue;
      }
      if (this.query[i] !== undefined) {
        result[i] =  this.query[i];
      }
    }

    if (result['target']) {
      result['target'] = result['target'].replace(/http:\/\/tun\.fi\//g, '');
    }

    if (this.query.loadedLaterThan !== undefined) {
      // queryParameters.set('loadedLaterThan', this.query.loadedLaterThan);
    }

    // Non query parameters (these will not have effect on result count)
    if (this.selected !== undefined && skipParams.indexOf('selected') === -1) {
      result['selected'] = this.selected.join(',');
    }

    if (this.aggregateBy !== undefined && skipParams.indexOf('aggregateBy') === -1) {
      result['aggregateBy'] = this.aggregateBy.join(',');
    }

    if (this.orderBy !== undefined && skipParams.indexOf('orderBy') === -1) {
      result['orderBy'] = this.orderBy.join(',');
    }

    if (this.pageSize !== undefined && skipParams.indexOf('pageSize') === -1) {
      result['pageSize'] = String(this.pageSize);
    }

    if (this.page !== undefined && skipParams.indexOf('page') === -1) {
      result['page'] = String(this.page);
    }

    return result;
  }

  public getURLSearchParams(queryParameters?: URLSearchParams, skipParams: string[] = []): URLSearchParams {
    if (!queryParameters) {
      queryParameters = new URLSearchParams();
    }
    let query = this.getQueryObject(skipParams);
    Object.keys(query).map((key) => {
      queryParameters.set(key, query[key]);
    });

    return queryParameters;
  }

  public updateUrl(location: Location, path?: string, skipParams?: string[], skipHistory = true): void {
    if (!path) {
      path = location.path(false).split('?')[0].split(';')[0];
    }
    let query = this.getQueryObject(skipParams);
    let extra = {skipLocationChange: skipHistory};
    if (Object.keys(query).length > 0) {
      extra['queryParams'] = this.getQueryObject(skipParams);
    } else {
      extra['preserveQueryParams'] = true;
    }
    this.router.navigate(path.split('/'), extra);
  }

  public queryUpdate(data = {}): void {
    this.queryUpdatedSource.next(data);
  }
}
