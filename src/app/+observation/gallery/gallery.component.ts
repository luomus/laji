import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Util } from '../../shared/service/util.service';
import { TaxonomyImage } from '../../shared/model/Taxonomy';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Logger } from '../../shared/logger/logger.service';
import { catchError, map, tap } from 'rxjs/operators';

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
  @Input() showPaginatorOnlyWhenNeeded = false;
  @Input() shortPager = false;
  @Input() eventOnImageClick = false;
  @Input() showViewSwitch = false;
  @Input() showPopover = false;
  @Input() sort: string[];
  @Input() view: 'compact'|'full' = 'compact';
  @Output() selected = new EventEmitter<boolean>();
  @Output() hasData = new EventEmitter<boolean>();

  images$: Observable<TaxonomyImage[]>;
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
    // TODO: think about this little more units are still basic search for this so might have to drop this
    // or target gathering and document endpoints
    const imgField = 'unit.media';
    query.hasUnitMedia = true;
    /*
    if (query.hasUnitMedia) {
      // pass
    } else if (query.hasGatheringMedia) {
      imgField = 'gathering.media';
    } else if (query.hasDocumentMedia) {
      imgField = 'document.media';
    } else {
      query.hasUnitMedia = true;
    }
    */
    this.images$ = this.warehouseApi.warehouseQueryListGet(query, [
        'unit.taxonVerbatim,unit.linkings.taxon.vernacularName,unit.linkings.taxon.scientificName,unit.reportedInformalTaxonGroup',
        imgField,
        // 'gathering.media',
        // 'document.media',
        'document.documentId,unit.unitId',
        this.extendedInfo ? '' : ''
      ], this.sort, this.pageSize, this.page).pipe(
      map((data) => {
        const images = [];
        this.total = Math.min(data.total, this.limit);
        if (data.results) {
          data.results.map(items => {
            const group = (items['unit'] && items['unit']['reportedInformalTaxonGroup']) ? items['unit']['reportedInformalTaxonGroup'] : '';
            const verbatim = (items['unit'] && items['unit']['taxonVerbatim']) ? items['unit']['taxonVerbatim'] : '';
            ['unit', 'gathering', 'document'].map((key) => {
              if (items[key] && items[key].media) {
                items[key].media.map(media => {
                  if (images.length >= this.limit) {
                    return;
                  }
                  media['documentId'] = items['document']['documentId'];
                  media['unitId'] = items['unit']['unitId'];
                  if (imgField === 'unit.media') {
                    media['vernacularName'] = items.unit
                      && items.unit.linkings
                      && items.unit.linkings.taxon
                      && items.unit.linkings.taxon.vernacularName || '';
                    media['scientificName'] = items['unit']
                      && items['unit']['linkings']
                      && items['unit']['linkings']['taxon']
                      && items['unit']['linkings']['taxon']['scientificName'] || verbatim || group || '';
                  }
                  images.push(media);
                });
              }
            });
          });
        }
        return images;
      }),
      catchError(err => {
        this.logger.error('Unable to fetch image from warehouse', err);
        return [];
      }),
      tap((images) => {
        this.loading = false;
        this.hasData.emit(images.length > 0);
        this.cd.detectChanges();
      })
    );
  }
}
