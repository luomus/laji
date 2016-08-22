import {Injectable} from "@angular/core";
import {WarehouseQueryInterface} from "../shared/model/WarehouseQueryInterface";
import {URLSearchParams} from "@angular/http";
import {Subject} from "rxjs";
import {Location} from "@angular/common";

@Injectable()
export class SearchQuery {

  private queryUpdatedSource = new Subject<WarehouseQueryInterface>();

  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public query:WarehouseQueryInterface = {};
  public page:number;
  public pageSize:number = 20;
  public includeNonValidTaxons:boolean = false;
  public selected:string[];
  public orderBy:string[];
  public aggregateBy:string[];

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
    'includeNonValidTaxons',
    'finnish',
    'invasive',
    'typeSpecimen',
    'hasDocumentMedia',
    'hasGatheringMedia',
    'hasUnittMedia',
    'hasMedia'
  ];

  numericTypes = [
    'dayOfYearBegin',
    'dayOfYearEnd',
    'individualCountMin',
    'individualCountMax'
  ];

  public setQueryFromURLSearchParams(queryParameters: URLSearchParams) {
    for(let i of this.arrayTypes) {
      if (queryParameters.has(i)) {
        this.query[i] = queryParameters.get(i)
          .split(',')
          .map(value => decodeURIComponent(value));
      } else {
        this.query[i] = undefined;
      }
    }

    for(let i of this.booleanTypes) {
      if (queryParameters.has(i)) {
        this.query[i] = queryParameters.get(i) === 'true';
      } else {
        this.query[i] = undefined;
      }
    }

    for(let i of this.numericTypes) {
      if (queryParameters.has(i)) {
        this.query[i] = +queryParameters.get(i);
      } else {
        this.query[i] = undefined;
      }
    }

    if (queryParameters.has('page')) {
      this.page = +queryParameters.get('page');
    }
  }

  public getQueryString(queryParameters?: URLSearchParams):URLSearchParams {
    if (!queryParameters) {
      queryParameters = new URLSearchParams();
    }
    for(let i of this.arrayTypes) {
      if (this.query[i] !== undefined) {
        if (this.query[i].length < 1 || this.query[0] === '') {
          continue;
        }
        let query = this.query[i]
          .filter(val => val.trim().length > 0)
          .join(',');
        if (query.length > 0) {
          queryParameters.set(i, query);
        }
      }
    }

    for(let i of this.booleanTypes) {
      if (this.query[i] !== undefined) {
        queryParameters.set(i, this.query[i] ? 'true' : 'false');
      }
    }

    for(let i of this.numericTypes) {
      if (this.query[i] !== undefined) {
        queryParameters.set(i, String(this.query[i]));
      }
    }

    if (this.query.loadedLaterThan !== undefined) {
      //queryParameters.set('loadedLaterThan', this.query.loadedLaterThan);
    }

    // Non query parameters (these will not have effect on result count)
    if (this.selected !== undefined) {
      //queryParameters.set('selected', this.selected.join(','));
    }

    if (this.aggregateBy !== undefined) {
      queryParameters.set('aggregateBy', this.aggregateBy.join(','));
    }

    if (this.orderBy !== undefined) {
      queryParameters.set('orderBy', this.orderBy.join(','));
    }

    if (this.pageSize !== undefined) {
      queryParameters.set('pageSize', String(this.pageSize));
    }

    if (this.page !== undefined) {
      queryParameters.set('page', String(this.page));
    }

    return queryParameters;
  }

  public updateUrl(location:Location, path?:string):void {
    if (!path) {
      path = location.path(false).split('?')[0];
    }
    let query = this.getQueryString().toString();
    query = query.length > 0 ? '?' + query : '';
    location.go(path + query);
  }

  public queryUpdate():void {
    this.queryUpdatedSource.next(this.query);
  }
}
