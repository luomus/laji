import {Component, OnChanges, Input, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { Image } from '../../../../shared/gallery/image-gallery/image.interface';

@Component({
  selector: 'laji-taxon-images',
  templateUrl: './taxon-images.component.html',
  styleUrls: ['./taxon-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonImagesComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonImages: Array<Image>;
  @Input() isFromMasterChecklist: boolean;

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
