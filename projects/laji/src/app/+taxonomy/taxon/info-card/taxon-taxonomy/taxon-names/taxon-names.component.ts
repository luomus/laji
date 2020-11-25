import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-names',
  templateUrl: './taxon-names.component.html',
  styleUrls: ['./taxon-names.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonNamesComponent implements OnInit {
  _taxon: Taxonomy;
  availableLangs = {'vernacularName': [], 'alternativeVernacularName': [], 'obsoleteVernacularName': [], 'synonym': [], 'tradeName': []};
  synonymTypes = [
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

  @Input() set taxon(taxon: Taxonomy) {
    this.availableLangs = {'vernacularName': [], 'alternativeVernacularName': [], 'obsoleteVernacularName': [], 'synonym': [], 'tradeName': []};
    for (const lang of ['fi', 'sv', 'en', 'se', 'ru']) {
      if (taxon.vernacularName && taxon.vernacularName[lang]) {
        this.availableLangs.vernacularName.push(lang);
      }
      if (taxon.alternativeVernacularName && taxon.alternativeVernacularName[lang]) {
        this.availableLangs.alternativeVernacularName.push(lang);
      }
      if (taxon.obsoleteVernacularName && taxon.obsoleteVernacularName[lang]) {
        this.availableLangs.obsoleteVernacularName.push(lang);
      }
      if (taxon.tradeName && taxon.tradeName[lang]) {
        this.availableLangs.tradeName.push(lang);
      }
    }

    this._taxon = taxon;
  }

  constructor() { }

  ngOnInit() {
  }

}
