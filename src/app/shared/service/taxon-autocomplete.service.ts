import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LabelPipe } from '../pipe/label.pipe';

@Injectable()

export class TaxonAutocompleteService {
  tmpTaxa: any;


  constructor(
    private translate: TranslateService,
    private labelPipe: LabelPipe
  ) { }

  getinfo(taxa: any[]) {
    taxa.map(
      t => {
        t.autocompleteDisplayName = this.getMatchingType(t['payload']);
        t.autocompleteSelectedName = this.getMatchingTypeName(t['payload']);
      }
    )
    return of(taxa);
  }

  getMatchingType(payload: any) {
     const scientificName = payload['cursiveName'] ? '<i>' + payload['scientificName'] + '</i>' : payload['scientificName'];
     const taxonRank = payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '';
     const informalGroupIcon = '<div class="informal-group-image ' + payload['informalTaxonGroups'][0].id +'"></div>';
     const flag = '<div class="autocomplete-small-flag finnish-flag"></div>'

    switch (payload['nameType']) {
      case 'MX.scientificName':
        return ''+ scientificName + '' + taxonRank + '<div class="flag-informalIcon">' + informalGroupIcon + flag + '</div>';
      case 'MX.euringCode':
        return "Euring Code";
      case 'MX.birdlifeCode':
        return "birdlifeCode";
      case 'MX.vernacularName':
        return "vernacularName";
      case 'MX.alternativeVernacularName':
        return "alternativeVernacularName";
      case 'MX.obsoleteVernacularName':
        return "obsoleteVernacularName";
      case 'MX.tradeName':
        return "tradeName";
    }
  }

  getMatchingTypeName(payload: any) {
    switch (payload['nameType']) {
      case 'MX.scientificName':
        return payload['scientificName'];
      case 'MX.euringCode':
        return "Euring Code";
      case 'MX.birdlifeCode':
        return "birdlifeCode";
      case 'MX.vernacularName':
        return "vernacularName";
      case 'MX.alternativeVernacularName':
        return "alternativeVernacularName";
      case 'MX.obsoleteVernacularName':
        return "obsoleteVernacularName";
      case 'MX.tradeName':
        return "tradeName";
    }
  }

  expandInfo(taxa) {
   
  }
}
