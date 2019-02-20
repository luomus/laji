import { Component, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TaxonomyDescription } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-descriptions',
  templateUrl: './taxon-descriptions.component.html',
  styleUrls: ['./taxon-descriptions.component.scss']
})
export class TaxonDescriptionsComponent implements OnChanges {
  @Input() taxonDescription: Array<TaxonomyDescription>;
  @Input() context: string;
  activeDescription = 0;
  @Output() descriptionChange = new EventEmitter<string>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.activeDescription = 0;
    if (this.taxonDescription && this.context) {
      this.taxonDescription.forEach((description, idx) => {
        if (description.id === this.context) {
          this.activeDescription = idx;
        }
      });
    }
  }

}
