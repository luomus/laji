import {Component, Input, Output, OnInit, OnChanges, EventEmitter} from '@angular/core';
import {Taxonomy, TaxonomyDescription} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-taxonomy',
  templateUrl: './taxon-taxonomy.component.html',
  styleUrls: ['./taxon-taxonomy.component.scss']
})
export class TaxonTaxonomyComponent implements OnInit, OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonDescription: TaxonomyDescription[];

  taxonConceptId: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    (this.taxon.additionalIds || []).map(id => {
      const parts = id.split(':');
      if (parts[0] === 'taxonid') {
        this.taxonConceptId = parts[1];
      }
    });
  }
}
