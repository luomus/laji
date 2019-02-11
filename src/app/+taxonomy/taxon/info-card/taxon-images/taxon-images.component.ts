import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Taxonomy, TaxonomyImage } from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-images',
  templateUrl: './taxon-images.component.html',
  styleUrls: ['./taxon-images.component.scss']
})
export class TaxonImagesComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonImages: Array<TaxonomyImage>;

  hasTypeSpecimens: boolean;
  hasCollectionImages: boolean;
  hasObservationImages: boolean;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.hasTypeSpecimens = undefined;
      this.hasCollectionImages = undefined;
      this.hasObservationImages = undefined;
    }
  }

}
