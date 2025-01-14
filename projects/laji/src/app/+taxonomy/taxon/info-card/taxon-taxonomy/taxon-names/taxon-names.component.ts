import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

interface AvailableLangs {
  vernacularName: string[];
 alternativeVernacularName: string[];
 obsoleteVernacularName: string[];
 colloquialVernacularName: string[];
 tradeName: string[];
};

@Component({
  selector: 'laji-taxon-names',
  templateUrl: './taxon-names.component.html',
  styleUrls: ['./taxon-names.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonNamesComponent {
  _taxon!: Taxonomy;
  availableLangs: AvailableLangs = {vernacularName: [], alternativeVernacularName: [], obsoleteVernacularName: [], colloquialVernacularName: [], tradeName: []};
  synonymTypes: (keyof Taxonomy)[] = [
    'basionyms',
    'objectiveSynonyms',
    'subjectiveSynonyms',
    'homotypicSynonyms',
    'heterotypicSynonyms',
    'synonyms',
    'misspelledNames',
    'orthographicVariants',
    'uncertainSynonyms',
    'misappliedNames',
    'alternativeNames'
  ];
  readonly names = [
    'vernacularName',
    'alternativeVernacularName',
    'obsoleteVernacularName',
    'colloquialVernacularName',
    'synonyms',
    'tradeName'
  ] as const;

  @Input() set taxon(taxon: Taxonomy) {
      this.availableLangs = {vernacularName: [], alternativeVernacularName: [], obsoleteVernacularName: [], colloquialVernacularName: [], tradeName: []};
      for (const lang of ['fi', 'sv', 'en', 'se', 'ru']) {
        if (taxon.vernacularName && (taxon.vernacularName as any)[lang]) {
          this.availableLangs.vernacularName.push(lang);
        }
        if (taxon.alternativeVernacularName && (taxon.alternativeVernacularName as any)[lang]) {
          this.availableLangs.alternativeVernacularName.push(lang);
        }
        if (taxon.obsoleteVernacularName && (taxon.obsoleteVernacularName as any)[lang]) {
          this.availableLangs.obsoleteVernacularName.push(lang);
        }
        if (taxon.tradeName && (taxon.tradeName as any)[lang]) {
          this.availableLangs.tradeName.push(lang);
        }
        if (taxon.colloquialVernacularName && (taxon.colloquialVernacularName as any)[lang]) {
          this.availableLangs.colloquialVernacularName.push(lang);
        }
      }
    this._taxon = taxon;
  }

  taxonHasSynonymKey(taxon: Taxonomy) {
    for (const synonymType of this.synonymTypes) {
      if (taxon.hasOwnProperty(synonymType)) {
        return true;
      }
    }
    return false;
  }

  hasOtherNamesBefore(array: (keyof AvailableLangs)[]) {
    for (const item of array) {
      if (this.availableLangs[item].length > 0) {
        return true;
      }
    }

    return false;
  }

}
