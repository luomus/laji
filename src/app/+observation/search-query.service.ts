import {Injectable} from "@angular/core";
import {WarehouseQueryInterface} from "../shared/model/WarehouseQueryInterface";
import {URLSearchParams} from "@angular/http";

@Injectable()
export class SearchQueryService {
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

  public setQueryFromQueryString() {

  }

  public getQueryString(queryParameters?: URLSearchParams) {
    if (!queryParameters) {
      queryParameters = new URLSearchParams();
    }
    for(let i of this.arrayTypes) {
      if (this.query[i] !== undefined) {
        queryParameters.set(i, this.query[i].join(','));
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
}
