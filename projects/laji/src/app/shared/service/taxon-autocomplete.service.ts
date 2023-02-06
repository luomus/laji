import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, concatMap, toArray } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from './triplestore-label.service';
import { Autocomplete } from '../model/Autocomplete';

export interface TaxaWithAutocomplete extends Autocomplete {
  autocompleteDisplayName: string;
  autocompleteSelectedName: string;
}


@Injectable({
  providedIn: 'root'
})

export class TaxonAutocompleteService {
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

    const scientificName = (payload['cursiveName'] ? '<i>' +
      this.capitalizeFirstLetter(this.addBold(payload['scientificName'], text)) + '</i>' : this.capitalizeFirstLetter(this.addBold(payload['scientificName'], text)));
    const vernacularName = this.addBold(payload['vernacularName'], text);
    const matchingName = this.addBold(payload['matchingName'], text);
    let string: string;

    switch (payload['nameType']) {
      case 'MX.scientificName':
        return this.createAutocompleteDisplayNameRow(scientificName, rank, payload['informalTaxonGroups'], payload['finnish']);
      case 'MX.birdlifeCode':
      case 'MX.euringCode':
        string = matchingName + '<span class="taxon-second-element"> - ' + scientificName + '</span>';
        return this.createAutocompleteDisplayNameRow(string, rank, payload['informalTaxonGroups'], payload['finnish']);
      case 'MX.vernacularName':
        string = (payload['vernacularName'] !== '' ? vernacularName + ' <span class="taxon-second-element">- ' + scientificName + '</span> '
        : scientificName + '<span class="taxon-second-element"> (' + matchingName + ') - </span><span class="taxon-third-element">' + scientificName + '</span>' );
        return this.createAutocompleteDisplayNameRow(string, rank, payload['informalTaxonGroups'], payload['finnish']);
      case 'MX.alternativeVernacularName':
      case 'MX.obsoleteVernacularName':
      case 'MX.tradeName':
        string = (payload['vernacularName'] !== ''
          ? vernacularName + '<span class="taxon-second-element"> - (' + matchingName + ') - </span><span class="taxon-third-element">' + scientificName + '</span>'
          : scientificName + ' <span class="taxon-second-element">(' + matchingName + ') - </span><span class="taxon-third-element">' + scientificName + '</span>' );
        return this.createAutocompleteDisplayNameRow(string, rank, payload['informalTaxonGroups'], payload['finnish']);
      case 'MX.colloquialVernacularName':
        string = (payload['vernacularName'] !== ''
          ? vernacularName + '<span class="taxon-second-element"> - ' + scientificName + '</span>' + '<span class="taxon-third-element"> (' + matchingName + ') </span>'
          : scientificName + ' <span class="taxon-second-element">(' + matchingName + ')</span>' );
        return this.createAutocompleteDisplayNameRow(string, rank, payload['informalTaxonGroups'], payload['finnish']);
      default:
        string = scientificName + ' <span class="taxon-second-element">(' + matchingName + ')</span>';
        return this.createAutocompleteDisplayNameRow(string, rank, payload['informalTaxonGroups'], payload['finnish']);
    }
  }

  private createAutocompleteDisplayNameRow(start: string, taxonRankId?: string, informalTaxonGroups?: {id: string}[], isFinnish?: boolean) {
    const taxonGroups = '<span class="container-taxon-group informal-group-image ' + (informalTaxonGroups || []).map(el => el.id).join(' ') + '"></span>';
    return start + '<span class="flag-taxonRank">' + (taxonRankId ? ' (' + taxonRankId + ') ' : '') +
    '<span class="container-flag-taxonRank"><span class="taxon-groups">' + taxonGroups + '</span>' +
    (isFinnish ? '<span class="autocomplete-small-flag finnish-flag"></span>' : '<span class="autocomplete-small-flag no-border"></span>' ) + '</span></span>';
  }

  getAutocompleteSelectedName(payload: any): string {
    switch (payload['nameType']) {
      case 'MX.scientificName':
        return payload['scientificName'];
      case 'MX.hasSynonym':
        return payload['scientificName'];
      case 'MX.birdlifeCode':
      case 'MX.euringCode':
        return payload['matchingName'].toLowerCase();
      case 'MX.vernacularName':
        return payload['vernacularName'] !== '' ? payload['vernacularName'] : payload['scientificName'];
      case 'MX.alternativeVernacularName':
      case 'MX.obsoleteVernacularName':
      case 'MX.tradeName':
      case 'MX.colloquialVernacularName':
        return payload['vernacularName'] !== '' ? payload['vernacularName'] : payload['scientificName'];
      default:
        return payload['scientificName'];
    }
  }

  private addBold(original: string, substring: string): string {
    // Pairs of bolded words and whether they've been bolded already (goal is to bold words only once).
    const boldedWords: [string, boolean][] = original.split(' ').map(w => [w, false]);

    substring.split(' ').forEach(w => {
      wordLoop: for (const i in boldedWords) { // eslint-disable-line guard-for-in
        const [_w, bolded] = boldedWords[i];
        if (bolded) {
          continue;
        }
        const escapedWord = escapeRegexp(w);
        const startRegexp = new RegExp(`^(${escapedWord})`, 'i');
        const endRegexp = new RegExp(`(${escapedWord})$`, 'i');
        for (const regexp of [startRegexp, endRegexp]) {
          const match = _w.match(regexp);
          if (match) {
            boldedWords[i] = [_w.replace(regexp, '<b>$1</b>'), true];
            break wordLoop;
          }
        }
      }
    });
    return boldedWords.reduce((joined, [w]) => joined.concat(' ', w), '');

    // https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function escapeRegexp(regexpString: string) {
      return regexpString.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
    }
  }

  private capitalizeFirstLetter(string: string) {
    if (string.startsWith('<')) {
      return '<b>' + string.charAt(3).toUpperCase() + string.slice(4);
    } else {
    return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }


}
