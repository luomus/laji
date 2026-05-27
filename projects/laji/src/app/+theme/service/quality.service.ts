import { map } from 'rxjs';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

@Injectable()
export class QualityService {
  constructor(
    private api: LajiApiClientService
  ) { }

  getAnnotationList(page = 1, pageSize = 50, orderBy?: string[], informalTaxonGroupId?: string, timeStart?: string, timeEnd?: string) {
    return this.api.get('/warehouse/query/annotation/list', { query: {
      cache: true,
      annotationType: ['USER_EFFECTIVE', 'COMMENT'] as any,
      informalTaxonGroupId,
      annotatedSameOrAfter: timeStart,
      annotatedSameOrBefore: timeEnd,
      selected: [
        'annotation', 'unit.media', 'document.documentId', 'unit.unitId', 'gathering.team', 'unit.taxonVerbatim',
        'unit.linkings.originalTaxon', 'unit.reportedInformalTaxonGroup'
      ] as any,
      orderBy: orderBy as any,
      pageSize,
      page
    } });
  }

  getMostActiveUsers(pageSize = 50, informalTaxonGroupId?: string, lastDate?: string): Observable<any> {
    return this.api.get('/warehouse/query/annotation/aggregate', { query: {
      cache: true,
      annotationType: 'USER_EFFECTIVE',
      informalTaxonGroupId,
      annotatedSameOrAfter: lastDate,
      aggregateBy: ['unit.annotations.annotationByPerson', 'unit.annotations.annotationByPersonName'],
      pageSize,
      page: 1,
      onlyCount: true
    } }).pipe(
      map(data => data.results),
      map(data => data.map((row: any) => {
          row.userId = row.aggregateBy['unit.annotations.annotationByPersonName'] || '';
          return row;
        })), );
  }
}
