import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];
type SimpleTaxon = components['schemas']['SimpleTaxon'];

type SimpleTaxonArrayKeys = {
  [K in keyof Taxon]: Taxon[K] extends SimpleTaxon[] ? K : never
}[keyof Taxon];

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
  _taxon!: Taxon;
  availableLangs: AvailableLangs = {vernacularName: [], alternativeVernacularName: [], obsoleteVernacularName: [], colloquialVernacularName: [], tradeName: []};
  synonymTypes: SimpleTaxonArrayKeys[] = [
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

  @Input() set taxon(taxon: Taxon) {
      this.availableLangs = {vernacularName: [], alternativeVernacularName: [], obsoleteVernacularName: [], colloquialVernacularName: [], tradeName: []};
      for (const lang of ['fi', 'sv', 'en'] as const) {
        if (taxon.vernacularNameMultiLang?.[lang]) {
          this.availableLangs.vernacularName.push(lang);
        }
        if (taxon.alternativeVernacularNameMultiLang?.[lang]) {
          this.availableLangs.alternativeVernacularName.push(lang);
        }
        if (taxon.obsoleteVernacularNameMultiLang?.[lang]) {
          this.availableLangs.obsoleteVernacularName.push(lang);
        }
        if (taxon.colloquialVernacularNameMultiLang?.[lang]) {
          this.availableLangs.colloquialVernacularName.push(lang);
        }
        if (taxon.tradeNameMultiLang?.[lang]) {
          this.availableLangs.tradeName.push(lang);
        }
      }
    this._taxon = taxon;
  }

  taxonHasSynonymKey(taxon: Taxon) {
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
