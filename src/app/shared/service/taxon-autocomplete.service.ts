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
     const scientificName = payload['cursiveName'] ? '<span class="cursive">' + payload['scientificName'] + '</span>' : payload['scientificName'];
     const taxonRank = payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '';
     const informalGroupIcon = '<div class="informal-group-image ' + payload['informalTaxonGroups'][0].id +'"></div>';
     const flag = payload['finnish'] ? '<div class="autocomplete-small-flag finnish-flag"></div>' : '<div class="autocomplete-small-flag no-border"></div>';
     const vernacularName = payload['vernacularName'] !== '' ? payload['vernacularName'] + '(' + this.translate.currentLang + ') (' + payload['matchingName'] + ') - ' + scientificName + ' '
     : scientificName + ' (' + payload['matchingName'] + ') - ' + scientificName;
     const otherVernacularName = payload['vernacularName'] !== '' ? payload['vernacularName'] + '(' + this.translate.currentLang + ') - ' + scientificName
     : scientificName + ' (' + payload['matchingName'] + ') - ' + scientificName;
     const synonim = scientificName + ' (' + payload['matchingName'] + ') ';

    switch (payload['nameType']) {
      case 'MX.scientificName':
        return ''+ scientificName + '<div class="responsive_container"> ' + taxonRank + '<div class="flag_icon">' + informalGroupIcon + flag + '</div></div>';
      case 'MX.hasSynonym':
        return synonim + '<div class="responsive_container"> ' + taxonRank + '<div class="flag_icon">' + informalGroupIcon + flag + '</div>';
      case 'MX.birdlifeCode':
        return "birdlifeCode";
      case 'MX.vernacularName':
        return ''+ vernacularName + '<div class="responsive_container">' + taxonRank + '<div class="flag_icon">' + informalGroupIcon + flag + '</div></div>';
      case 'MX.alternativeVernacularName':
      case 'MX.obsoleteVernacularName':
        return ''+ otherVernacularName + '<div class="responsive_container"> ' + taxonRank + '<div class="flag_icon">' + informalGroupIcon + flag + '</div></div>';
      case 'MX.tradeName':
        return "tradeName";
    }
  }

  getMatchingTypeName(payload: any) {
    switch (payload['nameType']) {
      case 'MX.scientificName':
        return payload['scientificName'];
      case 'MX.hasSynonym':
        return payload['scientificName'];
      case 'MX.birdlifeCode':
        return "birdlifeCode";
      case 'MX.vernacularName':
        return payload['vernacularName'] !== '' ? payload['vernacularName'] : payload['scientificName'];
      case 'MX.alternativeVernacularName':
      case 'MX.obsoleteVernacularName':
        return payload['vernacularName'] !== '' ? payload['vernacularName'] : payload['scientificName'];
      case 'MX.tradeName':
        return "tradeName";
    }
  }

  expandInfo(taxa) {
   
  }
}
