import {Component, OnInit, Input, ChangeDetectionStrategy} from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-names',
  templateUrl: './taxon-names.component.html',
  styleUrls: ['./taxon-names.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonNamesComponent implements OnInit {
  _taxon: Taxonomy;
  availableLangs = {'vernacularName': [], 'alternativeVernacularName': [], 'obsoleteVernacularName': [], 'tradeName': []};

  @Input() set taxon(taxon: Taxonomy) {
    this.availableLangs = {'vernacularName': [], 'alternativeVernacularName': [], 'obsoleteVernacularName': [], 'tradeName': []};

    for (const lang of ['fi', 'sv', 'en']) {
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
