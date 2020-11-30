import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInfoComponent implements OnInit {

  @Input() taxon: Taxonomy;

  langs = ['fi', 'sv', 'en', 'se', 'ru'];
  availableVernacularNames = [];

  constructor(public translate: TranslateService) { }

  ngOnInit() {
    this.initLangTaxonNames();
  }

  initLangTaxonNames() {
   this.langs.forEach(value => {
    if (this.taxon.vernacularName.hasOwnProperty(value)) {
      this.availableVernacularNames.push({'lang': value});
    }
   });
  }
}
