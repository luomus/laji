import { Injectable } from '@angular/core';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

@Injectable()
export class ResultUtil {

  constructor(
    private api: LajiApiClientService,
  ) { }

  getTaxon(taxonId: string) {
    return this.api.get('/taxa/{id}', {
      path: { id: taxonId },
      query: { selectedFields: 'scientificName,vernacularName,cursiveName' }
    });
  }
}
