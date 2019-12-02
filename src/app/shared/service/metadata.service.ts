import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphQLDataService } from '../../graph-ql/graph-ql-data.service';


@Injectable({providedIn: 'root'})
export class MetadataService {

  constructor(
    private graphQLDataService: GraphQLDataService,
    private translateService: TranslateService
  ) {
  }

  /**
   * Gets a specific range of all the ranges
   */
  getRange(range: string): Observable<any[]> {
    return this.graphQLDataService.getBaseData({
      lang: this.translateService.currentLang
    }).pipe(
      map(data => data.alts),
      map(alts => alts.find(alt => alt.id === range)),
      map(alt => alt && alt.options || [])
    );
  }

}
