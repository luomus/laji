import { Component, Input } from '@angular/core';
import {Taxonomy, TaxonomyDescription, TaxonomyDescriptionGroup} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-taxonomy',
  templateUrl: './taxon-taxonomy.component.html',
  styleUrls: ['./taxon-taxonomy.component.scss']
})
export class TaxonTaxonomyComponent {
  @Input() taxon: Taxonomy;

  taxonomyDescriptions: TaxonomyDescriptionGroup;
  _taxonDescription: TaxonomyDescription;

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.taxonomyDescriptions = undefined;
    this._taxonDescription = taxonDescription && taxonDescription.length > 0 ? taxonDescription[0] : undefined;

    if (this._taxonDescription) {
      (this._taxonDescription.groups || []).forEach(group => {
        if (group.group === 'MX.SDVG14') {
          this.taxonomyDescriptions = group;
        }
      });
    }
  }
}
