import { Component, OnInit } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { SearchQuery } from '../search-query.model';
import { Util } from '../../shared/service/util.service';
import { TaxonomyImage } from '../../shared/model/Taxonomy';
import { ValueDecoratorService } from '../result-list/value-decorator.sevice';
import { LabelPipe } from '../../shared/pipe/label.pipe';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'laji-gallery',
  styleUrls: ['./gallery.component.css'],
  templateUrl: 'gallery.component.html',
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe]
})
export class GalleryComponent implements OnInit {

  images: TaxonomyImage[];
  page: number = 1;
  total: number = 0;
  pageSize: number = 50;
  loading: boolean = false;

  constructor(
    private warehouseApi: WarehouseApi,
    private searchQuery: SearchQuery,
    private translate: TranslateService,
    private valueDecorator: ValueDecoratorService
  ) {
  }

  ngOnInit() {
    this.updateImages();
    this.searchQuery.queryUpdated$
      .subscribe((data) => {
        if (data.formSubmit) {
          this.page = 1;
          this.updateImages();
        }
      });
  }

  pageChanged(event) {
    this.page = event.page;
    this.updateImages();
  }

  updateImages() {
    let query = Util.clone(this.searchQuery.query);
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
      });
  }
}
