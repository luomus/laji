import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Util } from '../../shared/service/util.service';
import { TaxonomyImage } from '../../shared/model/Taxonomy';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-gallery',
  styleUrls: ['./gallery.component.css'],
  templateUrl: './gallery.component.html',
})
export class GalleryComponent implements OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() tick;
  @Input() pageSize = 50;
  @Input() shortPager = false;
  @Output() hasData = new EventEmitter<boolean>();

  images: TaxonomyImage[] = [];
  page = 1;
  total = 0;
  loading = false;

  constructor(
    private warehouseApi: WarehouseApi
  ) {
  }

  ngOnChanges() {
    this.page = 1;
    this.updateImages();
  }

  pageChanged(event) {
    this.page = event.page;
    this.updateImages();
  }

  updateImages() {
    if (!this.query) {
      return;
    }
    const query = Util.clone(this.query);
    this.loading = true;
    query.hasUnitMedia = true;
    this.warehouseApi.warehouseQueryListGet(query, [
        'unit.taxonVerbatim,unit.linkings.taxon.vernacularName,unit.linkings.taxon.scientificName',
        'unit.media',
        // 'gathering.media',
        // 'document.media',
        'document.documentId'
      ], undefined, this.pageSize, this.page)
      .map((data) => {
        const images = [];
        this.total = data.total;
        if (data.results) {
          data.results.map((items) => {
            const verbatim = (items['unit'] && items['unit']['taxonVerbatim']) ? items['unit']['taxonVerbatim'] : '';
            ['unit'].map((key) => {
              if (items[key] && items[key].media) {
                items[key].media.map(media => {
                  media['documentId'] = items['document']['documentId'];
                  media['vernacularName'] = items.unit
                    && items.unit.linkings
                    && items.unit.linkings.taxon
                    && items.unit.linkings.taxon.vernacularName || '';
                  media['scientificName'] = items['unit']
                    && items['unit']['linkings']
                    && items['unit']['linkings']['taxon']
                    && items['unit']['linkings']['taxon']['scientificName'] || verbatim || '';
                  images.push(media);
                });
              }
            });
          });
        }
        return images;
      })
      .subscribe((images) => {
        this.loading = false;
        this.images = images;
        this.hasData.emit(images.length > 0);
      });
  }
}
