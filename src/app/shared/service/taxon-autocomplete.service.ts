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
    switch (payload['nameType']) {
      case 'MX.scientificName':
        return ''+ (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName']) + '<div> ' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '') + '<div><div class="' + payload['informalTaxonGroups'][0].id +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div></div>';
      case 'MX.hasSynonym':
        return (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName'])
         + ' (' + (payload['matchingName'] + ') <div> ' 
         + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '') + '<div><div class="' + payload['informalTaxonGroups'][0].id +'"></div>') + (payload['finnish'] ? '<div></div>' : '<span></span>' ) + '</div>'
      case 'MX.birdlifeCode':
      case 'MX.euringCode':
      return payload['matchingName'] + ' - ' + (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName']) + '<div class="responsive_container">' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '' ) + '<div class="flag_icon"><div class="' + payload['informalTaxonGroups'][0].id +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div></div>';
      case 'MX.vernacularName':
        return ''+ (payload['vernacularName'] !== '' ? payload['vernacularName'] + '(' + this.translate.currentLang + ') (' + payload['matchingName'] + ') - ' + (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName']) + ' '
     : (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName']) + ' (' + payload['matchingName'] + ') - ' + (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName'])) + '<div>' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '') + '<div><div class="' + payload['informalTaxonGroups'][0].id +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div></div>';
      case 'MX.alternativeVernacularName':
      case 'MX.obsoleteVernacularName':
        return ''+ (payload['vernacularName'] !== '' ? payload['vernacularName'] + '(' + this.translate.currentLang + ') - ' + (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName'])
     : (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName']) + ' (' + payload['matchingName'] + ') - ' + (payload['cursiveName'] ? '<span>' + payload['scientificName'] + '</span>' : payload['scientificName'])) + '<div> ' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '' ) + '<div><div class="' + payload['informalTaxonGroups'][0].id +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div></div>';
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
      case 'MX.euringCode':
        return payload['matchingName'];
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
