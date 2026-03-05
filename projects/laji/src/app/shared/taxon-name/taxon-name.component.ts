import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MultiLanguage } from '../model/MultiLanguage';

@Component({
    selector: 'laji-taxon-name',
    templateUrl: './taxon-name.component.html',
    styleUrls: ['./taxon-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TaxonNameComponent {
  @Input() taxon: {
    id?: string;
    qname?: string;
    cursiveName?: boolean;
    scientificName?: string;
    vernacularName?: string | MultiLanguage;
    scientificNameAuthorship?: string;
    alternativeVernacularName?: string[] | MultiLanguage<string[]>;
    obsoleteVernacularName?: string[] | MultiLanguage<string[]>;
    colloquialVernacularName?: string[] | MultiLanguage<string[]>;
  } = {};
  @Input() taxonID?: string;
  @Input() addLink = true;
  @Input() addAuthor = false;
  @Input() warningOnMissingTaxonID = false;
  @Input() showScientificNameFirst = false;
  @Input() capitalizeName = false;
  @Input() hideObsoleteVernacularName = false;

  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }
}
