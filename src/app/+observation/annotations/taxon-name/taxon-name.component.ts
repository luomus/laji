import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Taxonomy } from 'app/shared/model/Taxonomy';
import {TranslateService} from '@ngx-translate/core';
import { taxonomyRoutes } from '../../../../../projects/iucn/src/app/+taxonomy/taxonomy.routes';

@Component({
  selector: 'laji-unit-annotation',
  templateUrl: './taxon-name.component.html',
  styleUrls: ['./taxon-name.component.scss']
})
export class TaxonNameComponent implements OnInit {

  _taxon: any;
  currentLang = this.transations.currentLang;

  @Input() showImage: boolean;
  @Input() unit: any;




  constructor(
  private transations: TranslateService
  ) { }

  ngOnInit() {
    this.fetchTaxon();
  }

  fetchTaxon() {
    if (this.unit.linkings) {
      if (this.unit.linkings.originalTaxon) {
        if (this.unit.linkings.originalTaxon.vernacularName) {
          if (this.unit.linkings.originalTaxon.vernacularName[this.currentLang]) {
            this._taxon = this.unit.linkings.originalTaxon.vernacularName[this.currentLang];
          } else {
            for (const lang of ['fi', 'en', 'sv' ]) {
              if (this.unit.linkings.originalTaxon.vernacularName[lang] && lang !== this.currentLang) {
              return this._taxon = this.unit.linkings.originalTaxon.vernacularName[lang] + ' (' + lang + ')';
              }
            }
          }
        }
      }
    }
  }

}
