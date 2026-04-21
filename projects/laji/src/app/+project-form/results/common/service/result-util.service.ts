import { Injectable } from '@angular/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Injectable()
export class ResultUtil {

  constructor(
    private api: LajiApiClientBService,
  ) { }

  getTaxon(taxonId: string) {
    return this.api.get('/taxa/{id}', {
      path: { id: taxonId },
      query: { selectedFields: 'scientificName,vernacularName,cursiveName' }
    });
  }
}
