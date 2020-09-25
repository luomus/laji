import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, concatMap, toArray } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from './triplestore-label.service';
import { Autocomplete } from '../model/Autocomplete';

interface TaxaWithAutocomplete extends Autocomplete {
  autocompleteDisplayName: string;
  autocompleteSelectedName: string;
}


@Injectable({
  providedIn: 'root'
})

export class TaxonAutocompleteService {
  scientificName: string;
  vernacularName: string;
  matchingName: string;

  constructor(
    private translate: TranslateService,
    private tripleStoreService: TriplestoreLabelService
  ) { }

  getInfo(taxa: any[], text: string): Observable<TaxaWithAutocomplete[]> {
    return from(taxa).pipe(
      concatMap(taxon => this.tripleStoreService.get(taxon['payload']['taxonRankId'], this.translate.currentLang).pipe(
        map(rank => ({
          ...taxon,
          autocompleteDisplayName: this.getAutocompleteDisplayName(taxon['payload'], rank, text),
          autocompleteSelectedName: this.getAutocompleteSelectedName(taxon['payload'])
        }))
      )),
      toArray()
    );
  }


  getAutocompleteDisplayName(payload: any, rank: string, text: string): string {

    const scientificName = this.addBold(payload['scientificName'], text);
    const vernacularName = this.addBold(payload['vernacularName'], text);
    this.matchingName = this.addBold(payload['matchingName'], text);

    switch (payload['nameType']) {
      case 'MX.scientificName':
        return (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName)
        +' <div> (' + rank + ') <div> <div class="' + (payload['informalTaxonGroups'].length > 0 ? (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') : '') +'"></div>'+ (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div></div>';
      case 'MX.hasSynonym':
        return (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName)
         +' (' + (this.matchingName + ') <div>'
         + (payload['taxonRankId'] ? ' (' + rank + ') ' : '') + '<div><div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>') + (payload['finnish'] ? '<div></div>' : '<span></span>' ) + '</div></div>'
      case 'MX.birdlifeCode':
        return this.matchingName + ' - ' + (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName) + '<div class="responsive_container">' + (payload['taxonRankId'] ? ' (' + rank + ') ' : '' ) + '<div class="flag_icon"><div class="' + (payload['informalTaxonGroups'].length > 0 ? (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.euringCode':
        return this.matchingName + ' - ' + (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName) + '<div class="responsive_container">' + (payload['taxonRankId'] ? ' (' + rank + ') ' : '' ) + '<div class="flag_icon"><div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.vernacularName':
        return (payload['vernacularName'] !== '' ? vernacularName + ' - ' + (payload['cursiveName'] ? '<span>' + scientificName + '</span>' : scientificName) + ' '
        : (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName) + ' (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<span>' + scientificName + '</span>' : scientificName)) + '<div>' + (payload['taxonRankId'] ? ' (' + rank + ') ' : '') + '<div> <div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.alternativeVernacularName':
        return (payload['vernacularName'] !== '' ? vernacularName + ' - (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName)
        : (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName) + ' (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName)) + '<div>' + (payload['taxonRankId'] ? ' (' + rank + ') ' : '' ) + '<div> <div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.obsoleteVernacularName':
        return (payload['vernacularName'] !== '' ? vernacularName + ' - (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName)
        : (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName) + ' (' + this.matchingName + ') - ' + (payload['cursiveName'] ? '<i>' + scientificName + '</i>' : scientificName)) + '<div>' + (payload['taxonRankId'] ? ' (' + rank + ') ' : '' ) + '<div> <div class="' + (payload['informalTaxonGroups'].length > 0 ? payload['informalTaxonGroups'][0].id : '') +'"></div>' + (payload['finnish'] ? '<div></div>' : '<span></span>') + '</div>';
      case 'MX.tradeName':
        return "tradeName";
    }
  }

  getAutocompleteSelectedName(payload: any): string {
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

  addBold(original: string, substring: string): string {
    const words = substring.split(' ');
    words.forEach(el => {
      substring = original.includes(el.toLowerCase()) ? el.toLowerCase() : this.capitalize(el);
      original = original.includes(substring) ?
      original.replace(substring,'<b>' + substring + '</b>') : original;
    })
    return original;
  }

  capitalize(string): string {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

}
