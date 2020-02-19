import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Taxonomy } from 'app/shared/model/Taxonomy';
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
  }

}
