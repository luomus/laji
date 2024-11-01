import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ResultService } from '../common/service/result.service';

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
    );
  }
}
