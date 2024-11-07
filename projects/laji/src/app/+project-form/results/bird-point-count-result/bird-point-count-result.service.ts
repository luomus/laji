import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ResultService } from '../common/service/result.service';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

@Injectable()
export class BirdPointCountResultService {

  constructor(
    private warehouseApi: WarehouseApi,
    private resultService: ResultService
  ) { }

  getCensusList(year?: number): Observable<any[]> {
    const yearMonth = year ? (Array.isArray(year) ? year.map(String) : [year.toString()]) : [];

    const query = {
      collectionId: ['HR.157'],
      yearMonth
    };

    return this.resultService.getListWithUnitStats(
      this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        query,
        ['document.documentId', 'document.namedPlace.name', 'document.namedPlace.municipalityDisplayName',
          'document.namedPlace.ykj10km.lat', 'document.namedPlace.ykj10km.lon',
          'document.namedPlace.birdAssociationAreaDisplayName', 'gathering.eventDate.begin'],
        ['document.namedPlace.birdAssociationAreaDisplayName', 'gathering.eventDate.begin DESC'],
        10000,
        1,
        undefined,
        true
      )
    ).pipe(
      switchMap(result => this.resultService.addUnitStatsToResults(result, query))
    ).pipe(
      switchMap(result => this.addModifiedDateToResults(result, query))
    );
  }

  addModifiedDateToResults(result: any[], query: WarehouseQueryInterface) {
    return this.resultService.getListWithUnitStats(
      this.warehouseApi.warehouseQueryDocumentAggregateGet(
        {
          formId: 'MHL.75',
          createdDateYear: Number(query.yearMonth[0])
        },
        ['document.documentId', 'document.modifiedDate'],
        undefined,
        10000,
        1,
        undefined,
        false
      )
    ).pipe(
      map(list => {
        const statsByDocumentId = {};
        list.map(l => {
          statsByDocumentId[l['document.documentId']] = l;
        });
        return statsByDocumentId;
      }),
      map(statsByDocumentId => {
        for (const r of result) {
          if (statsByDocumentId[r['document.documentId']]) {
            const stats = statsByDocumentId[r['document.documentId']];
            r['document.modifiedDate'] = stats['document.modifiedDate'];
          }
        }
        return result;
      })
    );
  }
}
