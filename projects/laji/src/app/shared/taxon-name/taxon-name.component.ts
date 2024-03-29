import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

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
    alternativeVernacularName?: any;
    obsoleteVernacularName?: any;
    colloquialVernacularName?: any;
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
