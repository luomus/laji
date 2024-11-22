import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ResultService } from '../common/service/result.service';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

export interface BirdPointCountFact {
  documentId: string;
  pairCountInner: number;
  pairCountOuter: number;
  vernacularName: {
    fi: string;
    sv: string;
    en: string;
  };
}

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
          createdDateYear: query.yearMonth ? Number(query.yearMonth[0]) : undefined
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
        const statsByDocumentId: any = {};
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

  getDocumentFacts(documentId: string): Observable<BirdPointCountFact[]> {
    return this.warehouseApi.warehouseQueryListGet(
      {
        documentId: [documentId]
      },
      [
        'unit.facts',
        'unit.linkings.taxon.vernacularName',
        'unit.linkings.taxon.scientificName'
      ],
      undefined,
      10000,
      1,
      undefined
    ).pipe(
      map(result => {
        const facts = result.results.map(item => {
          let pairCountInner = 0;
          let pairCountOuter = 0;
          item?.unit?.facts.forEach((f: any) => {
            if (f.fact === 'http://tun.fi/MY.pairCountInner') {
              pairCountInner = f.integerValue;
            }
            if (f.fact === 'http://tun.fi/MY.pairCountOuter') {
              pairCountOuter = f.integerValue;
            }
          });
          const vernacularName = item?.unit?.linkings?.taxon?.vernacularName
            ? item.unit.linkings.taxon.vernacularName
            : { fi: '', sv: '', en: '' };
          return {
            documentId,
            pairCountInner,
            pairCountOuter,
            vernacularName
          };
        });
        return facts;
      })
    );
  }
}
