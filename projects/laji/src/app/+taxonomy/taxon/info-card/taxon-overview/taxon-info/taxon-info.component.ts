import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { Global } from 'projects/laji/src/environments/global';

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInfoComponent implements OnInit {

  @Input() taxon: Taxonomy;

  langs = Global.langs;
  availableVernacularNames = [];

  constructor(public translate: TranslateService) { }

  ngOnInit() {
    this.initLangTaxonNames();
  }

  initLangTaxonNames() {
    for (const key in this.langs) {
      if (this.taxon.vernacularName.hasOwnProperty(key)) {
        this.availableVernacularNames.push({'lang': key, 'fullLang': this.langs[key]});
      }
    }
  }
}
