import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges,
  Output
} from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Util } from '../../shared/service/util.service';
import { TaxonomyImage } from '../../shared/model/Taxonomy';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Logger } from '../../shared/logger/logger.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'laji-gallery',
  styleUrls: ['./gallery.component.css'],
  templateUrl: './gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() extendedInfo = false;
  @Input() tick;
  @Input() pageSize = 50;
  @Input() limit = 1000;
  @Input() showPaginator = true;
  @Input() shortPager = false;
  @Input() eventOnImageClick = false;
  @Input() showViewSwitch = false;
  @Input() showPopover = false;
  @Input() sort: string[];
  @Input() view: 'compact'|'full' = 'compact';
  @Output() selected = new EventEmitter<boolean>();
  @Output() hasData = new EventEmitter<boolean>();

  images: TaxonomyImage[] = [];
  page = 1;
  total = 0;
  loading = false;

  constructor(
    private warehouseApi: WarehouseApi,
    private cd: ChangeDetectorRef,
    private logger: Logger
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
    if (WarehouseApi.isEmptyQuery(query)) {
      query.cache = true;
    }
    this.loading = true;
    query.hasUnitMedia = true;
    this.cd.markForCheck();
    this.warehouseApi.warehouseQueryListGet(query, [
        'unit.taxonVerbatim,unit.linkings.taxon.vernacularName,unit.linkings.taxon.scientificName',
        'unit.media',
        // 'gathering.media',
        // 'document.media',
        'document.documentId,unit.unitId',
        this.extendedInfo ? '' : ''
      ], this.sort, this.pageSize, this.page)
      .timeout(WarehouseApi.longTimeout)
      .retryWhen(errors => errors.delay(1000).take(3).concat(Observable.throw(errors)))
      .map((data) => {
        const images = [];
        this.total = Math.min(data.total, this.limit);
        if (data.results) {
          let cnt = 1;
          data.results.map(items => {
            const verbatim = (items['unit'] && items['unit']['taxonVerbatim']) ? items['unit']['taxonVerbatim'] : '';
            ['unit'].map((key) => {
              if (items[key] && items[key].media) {
                if (++cnt >= this.limit) {
                  return;
                }
                items[key].media.map(media => {
                  media['documentId'] = items['document']['documentId'];
                  media['unitId'] = items['unit']['unitId'];
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
        this.cd.markForCheck();
      }, (err) => {
        this.loading = false;
        this.hasData.emit(false);
        this.logger.error('Unable to fetch image from warehouse', err);
        this.cd.markForCheck();
      });
  }
}
