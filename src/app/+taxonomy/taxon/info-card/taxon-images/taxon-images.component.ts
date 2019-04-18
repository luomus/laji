import {Component, OnChanges, Input, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { Image } from '../../../../shared/gallery/image-gallery/image.interface';
import { InfoCardQueryService } from '../shared/service/info-card-query.service';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';

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

  typeSpecimenQuery: WarehouseQueryInterface;
  collectionSpecimenQuery: WarehouseQueryInterface;
  reliableObservationQuery: WarehouseQueryInterface;

  hasTypeSpecimens: boolean;
  hasCollectionImages: boolean;
  hasObservationImages: boolean;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.typeSpecimenQuery = InfoCardQueryService.getTypeSpecimenQuery(this.taxon.id);
      this.collectionSpecimenQuery = InfoCardQueryService.getCollectionSpecimenQuery(this.taxon.id);
      this.reliableObservationQuery = InfoCardQueryService.getReliableObservationQuery(this.taxon.id);

      this.hasTypeSpecimens = undefined;
      this.hasCollectionImages = undefined;
      this.hasObservationImages = undefined;
    }
  }

}
