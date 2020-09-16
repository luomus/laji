import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LabelPipe } from '../pipe/label.pipe';

@Injectable()

export class TaxonAutocompleteService {
  scientificName: string;
  vernacularName: string;
  matchingName: string;
  

  constructor(
    private translate: TranslateService,
    private labelPipe: LabelPipe
  ) { }

  getinfo(taxa: any[], text:string) {
    taxa.map(
      t => {
        t.autocompleteDisplayName = this.getAutocompleteDisplayName(t['payload'], text);
        t.autocompleteSelectedName = this.getAutocompleteSelectedName(t['payload']);
      }
    )
    return of(taxa);
  }

  getAutocompleteDisplayName(payload: any, text: string) {

    this.scientificName = this.addBold(payload['scientificName'], text);
    this.vernacularName = this.addBold(payload['vernacularName'], text);
    this.matchingName = this.addBold(payload['matchingName'], text);

    switch (payload['nameType']) {
      case 'MX.scientificName':
        return (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName)
        +' <div> (' + this.labelPipe.transform(payload['taxonRankId']) + ') <div> <div class="' + (payload['informalTaxonGroups'].length > 0 ? (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') : '') +'"></div>'+ (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div></div>';
      case 'MX.hasSynonym':
        return (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName)
         +' (' + (this.matchingName + ') <div>' 
         + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '') + '<div><div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>') + (payload['finnish'] ? '<div></div>' : '<span></span>' ) + '</div></div>'
      case 'MX.birdlifeCode':
        return this.matchingName + ' - ' + (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName) + '<div class="responsive_container">' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '' ) + '<div class="flag_icon"><div class="' + (payload['informalTaxonGroups'].length > 0 ? (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.euringCode':
        return this.matchingName + ' - ' + (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName) + '<div class="responsive_container">' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '' ) + '<div class="flag_icon"><div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.vernacularName':
        return (payload['vernacularName'] !== '' ? this.vernacularName + ' - ' + (payload['cursiveName'] ? '<span>' + this.scientificName + '</span>' : this.scientificName) + ' '
        : (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName) + ' (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<span>' + this.scientificName + '</span>' : this.scientificName)) + '<div>' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '') + '<div> <div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.alternativeVernacularName':
        return (payload['vernacularName'] !== '' ? this.vernacularName + ' - (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName)
        : (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName) + ' (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName)) + '<div>' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '' ) + '<div> <div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.obsoleteVernacularName':
        return (payload['vernacularName'] !== '' ? this.vernacularName + ' - (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName)
        : (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName) + ' (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<i>' + this.scientificName + '</i>' : this.scientificName)) + '<div>' + (payload['taxonRankId'] ? ' (' + this.labelPipe.transform(payload['taxonRankId']) + ') ' : '' ) + '<div> <div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.tradeName':
        return "tradeName";
    }
  }

  getAutocompleteSelectedName(payload: any) {
    switch (payload['nameType']) {
      case 'MX.scientificName':
        return payload['scientificName'];
      case 'MX.hasSynonym':
        return payload['scientificName'];
      case 'MX.birdlifeCode':
      case 'MX.euringCode':
        return this.matchingName;
      case 'MX.vernacularName':
        return payload['vernacularName'] !== '' ? payload['vernacularName'] : payload['scientificName'];
      case 'MX.alternativeVernacularName':
      case 'MX.obsoleteVernacularName':
        return payload['vernacularName'] !== '' ? payload['vernacularName'] : payload['scientificName'];
      case 'MX.tradeName':
        return "tradeName";
    }
  }

  addBold(original: string, substring: string) {
    const words = substring.split(' ');
    words.forEach(el => {
      substring = original.includes(el.toLowerCase()) ? el.toLowerCase() : this.capitalize(el);
      original = original.includes(substring) ? 
      original.replace(substring,'<b>' + substring + '</b>') : original;
    })
    return original;
  }

  capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

}
