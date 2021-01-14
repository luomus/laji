import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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

  imageSets: { title: string; hasData?: boolean; query: WarehouseQueryInterface }[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.imageSets = [
        {
          title: 'taxonomy.typeSpecimens',
          query: InfoCardQueryService.getSpecimenQuery(this.taxon.id, true)
        }, {
          title: 'taxonomy.collectionSpecimens',
          query: InfoCardQueryService.getSpecimenQuery(this.taxon.id, false)
        }, {
          title: 'taxonomy.confirmedObservations',
          query: InfoCardQueryService.getReliableHumanObservationQuery(this.taxon.id)
        }];
    }
  }

}
