import { Component, OnInit, Input } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';


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
    if (this.unit.linkings) {
      if (this.unit.linkings.taxon) {
        this.unit.linkings.taxon.cursiveName = true;
      }
      if (this.unit.linkings.originalTaxon) {
        this.unit.linkings.originalTaxon.cursiveName = true;
      }
    }
  }

}
