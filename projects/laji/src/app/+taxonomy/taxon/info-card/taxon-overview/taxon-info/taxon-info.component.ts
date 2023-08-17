import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInfoComponent implements OnChanges, OnDestroy {

  @Input() taxon: Taxonomy;

  langs = ['fi', 'sv', 'en', 'se', 'ru'];
  availableVernacularNames: Array<Record<string, string>>;
  availableTaxonNames: {vernacularNames: Array<Record<string, string>>; colloquialVernacularNames: Array<Record<string, string>>};

  constructor(
    public translate: TranslateService
    ) { }

  ngOnChanges() {
    this.initLangTaxonNames();
  }

  ngOnDestroy() {
  }

  initLangTaxonNames() {
    this.availableVernacularNames = [];
    this.availableTaxonNames = {vernacularNames: [], colloquialVernacularNames: []};

    this.langs.forEach(value => {
      if (this.taxon?.vernacularName?.[value]) {
        this.availableVernacularNames.push({lang: value});
        this.availableTaxonNames.vernacularNames.push({lang: value});
      }
      if (this.taxon?.colloquialVernacularName?.[value]) {
        this.availableTaxonNames.colloquialVernacularNames.push({lang: value});
      }
    });
    }
  }
