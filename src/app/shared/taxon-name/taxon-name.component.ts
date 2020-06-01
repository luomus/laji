import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-taxon-name',
  templateUrl: './taxon-name.component.html',
  styleUrls: ['./taxon-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonNameComponent {

  @Input() taxon: {
    id?: string;
    qname?: string;
    cursiveName?: boolean;
    scientificName?: string;
    vernacularName?: string | {[lang: string]: string};
    scientificNameAuthorship?: string;
    alternativeVernacularName?;
    obsoleteVernacularName?;
  };
  @Input() taxonID: string;
  @Input() addLink = true;
  @Input() addAuthor = false;
  @Input() warningOnMissingTaxonID = false;
  @Input() showScientificNameFirst = false;

  constructor(private translate: TranslateService) {}

  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }

  getAlternativeNames() {
    const alternativeNames: string[] = [];
    if (this.taxon.alternativeVernacularName) {
      alternativeNames.push(...this.taxon.alternativeVernacularName[this.translate.currentLang]);
    }
    if (this.taxon.obsoleteVernacularName) {
      alternativeNames.push(...this.taxon.obsoleteVernacularName[this.translate.currentLang]);
    }
    return alternativeNames.reduce((prev, curr) => prev += (', ' + curr));
  }
}
