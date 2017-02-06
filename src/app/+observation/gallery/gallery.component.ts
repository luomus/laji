import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Util } from '../../shared/service/util.service';
import { TaxonomyImage } from '../../shared/model/Taxonomy';
import { ValueDecoratorService } from '../result-list/value-decorator.sevice';
import { LabelPipe } from '../../shared/pipe/label.pipe';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { TranslateService } from 'ng2-translate';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-gallery',
  styleUrls: ['./gallery.component.css'],
  templateUrl: './gallery.component.html',
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe]
})
export class GalleryComponent implements OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() tick;
  @Input() pageSize: number = 50;
  @Input() shortPager = false;
  @Output() hasData = new EventEmitter<boolean>();

  images: TaxonomyImage[] = [];
  page = 1;
  total = 0;
  loading = false;

  constructor(
    private warehouseApi: WarehouseApi,
    private translate: TranslateService,
    private valueDecorator: ValueDecoratorService
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
    let query = Util.clone(this.query);
    this.loading = true;
    query.hasUnitMedia = true;
    this.warehouseApi.warehouseQueryListGet(query, [
        'unit.taxonVerbatim,unit.linkings.taxon.vernacularName',
        'unit.media',
        // 'gathering.media',
        // 'document.media',
        'document.documentId'
      ], undefined, this.pageSize, this.page)
      .map((data) => {
        let images = [];
        this.total = data.total;
        if (data.results) {
          this.valueDecorator.lang = this.translate.currentLang;
          data.results.map((items) => {
            let name = (items['unit'] && items['unit']['taxonVerbatim']) ?
              items['unit']['taxonVerbatim'] : '';
            let vernacularName = this.valueDecorator
              .decorate('unit.taxonVerbatim', name, items);
            ['unit'].map((key) => {
              if (items[key] && items[key].media) {
                items[key].media.map(media => {
                  media['documentId'] = items['document']['documentId'];
                  media['vernacularName'] = vernacularName;
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
