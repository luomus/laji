import { Component, Input } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-taxonomy',
  templateUrl: './taxon-taxonomy.component.html',
  styleUrls: ['./taxon-taxonomy.component.scss']
})
export class TaxonTaxonomyComponent {
  @Input() taxon: Taxonomy;
  @Input() taxonDescription: TaxonomyDescription[];
}
