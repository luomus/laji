import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaxonAutocompleteService {
  tmpTaxa: any;


  constructor(
    private translate: TranslateService
  ) { }

  getinfo(taxa: any[]) {
    taxa.map(
      t => {
        t['payload'].autocompleteDisplayName = this.getMatchingType(t['payload']);
        t['payload'].autocompleteSelectedName = this.getMatchingType(t['payload']);
      }
    )
    return of(taxa);
  }

  getMatchingType(payload: any) {
   return "";
  }

  expandInfo(taxa) {
   console.log(taxa)
  }
}
