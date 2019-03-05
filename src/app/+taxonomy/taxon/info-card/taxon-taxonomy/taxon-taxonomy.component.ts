import { Component, Input, OnChanges } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-taxonomy',
  templateUrl: './taxon-taxonomy.component.html',
  styleUrls: ['./taxon-taxonomy.component.scss']
})
export class TaxonTaxonomyComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonDescription: TaxonomyDescription[];

  taxonConceptId: string;

  ngOnChanges() {
    this.taxonConceptId = undefined;
    if (this.taxon.taxonConceptIds && this.taxon.taxonConceptIds[0]) {
      this.taxonConceptId = this.taxon.taxonConceptIds[0].replace('taxonid:', '');
    }
  }
}
