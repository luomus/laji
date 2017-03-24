import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { CoordinateService } from '../../shared/service/coordinate.service';

@Injectable()
export class ResultService {

  private state = {
    taxon: {
      key: '',
      data: {},
      pending: undefined,
      pendingKey: ''
    },
    result: {
      key: '',
      data: [],
      pending: undefined,
      pendingKey: ''
    },
    list: {
      key: '',
      data: [],
      pending: undefined,
      pendingKey: ''
    },
    map: {
      key: undefined,
      data: [],
      pending: undefined,
      pendingKey: ''
    }
  };

  constructor(
    private warehouseApi: WarehouseApi,
    private taxonomyApi: TaxonomyApi,
    private coordinateService: CoordinateService
  ) { }

  getTaxon(taxonId: string) {
    return this._fetch('taxon', taxonId, this.taxonomyApi.taxonomyFindBySubject(
      taxonId,
      'multi',
      {
        'selectedFields': 'scientificName,vernacularName,cursiveName'
      }
    ));
  }

  getResults(collectionId: string, informalGroup: string, time: string, lang: string): Observable<any> {
    let vernacular = 'unit.linkings.taxon.nameFinnish';
    switch (lang) {
      case 'en':
        vernacular = 'unit.linkings.taxon.nameEnglish';
        break;
      case 'sv':
        vernacular = 'unit.linkings.taxon.nameSwedish';
    }
    const cacheKey = collectionId + ':' + informalGroup + ':' + time + ':' + lang;
    return this._fetch('result', cacheKey, this.warehouseApi.warehouseQueryAggregateGet(
      {
        collectionId: [collectionId],
        informalTaxonGroupId: [informalGroup],
        time: [time]
      },
      ['unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.taxonomicOrder', vernacular],
      ['3'],
      1000,
      1,
      false,
      false
    ))
      .map(data => data.results)
      .map(data => {
        return data.map(row => {
          row.aggregateBy['vernacularName'] =
            row.aggregateBy['unit.linkings.taxon.nameFinnish'] ||
            row.aggregateBy['unit.linkings.taxon.nameEnglish'] ||
            row.aggregateBy['unit.linkings.taxon.nameSwedish'];
          return row;
        });
      });
  }

  getList(grid: string, collectionId: string, taxonId: string, time: string, page: number): Observable<any> {
    const cacheKey = grid + ':' + collectionId + ':' + taxonId + ':' + time + ':' + page;
    return this._fetch('list', cacheKey, this.warehouseApi.warehouseQueryListGet(
      {
        collectionId: [collectionId],
        taxonId: [taxonId],
        time: [time],
        ykj3: grid
      },
      ['document.documentId,gathering.eventDate.begin,gathering.eventDate.end,gathering.municipality,gathering.province,' +
      'gathering.team,gathering.timeBegin,gathering.timeEnd,unit.unitId,unit.linkings.taxon.scientificName'],
      undefined,
      100,
      page
    ));
  }

  getGeoJson(taxonId: string, time: string, collectionId: string): Observable<any> {
    return this._fetch('map', taxonId + time,
      this.warehouseApi
        .warehouseQueryAggregateGet(
          {
            collectionId: [collectionId],
            countryId: ['ML.206'],
            taxonId: [taxonId],
            time: [time]
          },
          ['gathering.conversions.ykj3.lat,gathering.conversions.ykj3.lon'],
          ['1'],
          5000,
          1,
          false,
          false
        )
        .map(data => data.results)
        .map(data => this._resultToGeoJson(data))
    );
  }

  private _fetch(type: 'map'|'list'|'result'|'taxon', cacheKey: string, request): Observable<any> {
    if (this.state[type].key === cacheKey) {
      return Observable.of(this.state[type].data);
    } else if (this.state[type].pendingKey === cacheKey && this.state[type].pending) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        this.state[type].pending.subscribe(
          (data) => { onComplete(data); }
        );
      });
    }
    this.state[type].pendingKey = cacheKey;
    this.state[type].pending    = request
      .do(data => {
        this.state[type].data = data;
        this.state[type].key  = cacheKey;
      });
    return this.state[type].pending ;
  }

  private _resultToGeoJson(data) {

    const features = [];
    data.map(result => {
      features.push(this.coordinateService.convertYkjToGeoJsonFeature(
        result.aggregateBy['gathering.conversions.ykj3.lat'],
        result.aggregateBy['gathering.conversions.ykj3.lon'],
        {
          count: result.count || 0,
          individualCountSum: result.individualCountSum || 0,
          newestRecord: result.newestRecord || '',
          oldestRecord: result.oldestRecord || '',
          grid: result.aggregateBy['gathering.conversions.ykj3.lat'] + ':' + result.aggregateBy['gathering.conversions.ykj3.lon']
        }
      ));
    });
    return features;
  }

}
