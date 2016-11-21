import { Component, OnInit } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { SearchQuery } from '../search-query.model';
import { Util } from '../../shared/service/util.service';
import { TaxonomyImage } from '../../shared/model/Taxonomy';

@Component({
  selector: 'laji-gallery',
  styleUrls: ['./gallery.component.css'],
  templateUrl: 'gallery.component.html'
})
export class GalleryComponent implements OnInit {

  images: TaxonomyImage[];
  page: number = 1;
  total: number = 0;
  pageSize: number = 50;
  loading: boolean = false;

  constructor(
    private warehouseApi: WarehouseApi,
    private searchQuery: SearchQuery
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
    query.hasMedia = true;
    this.warehouseApi.warehouseQueryListGet(query, [
        'unit.media',
        'gathering.media',
        'document.media',
      ], undefined, this.pageSize, this.page)
      .map((data) => {
        let images = [];
        this.total = data.total;
        if (data.results) {
          data.results.map((items) => {
            ['document', 'gathering', 'unit'].map((key) => {
              if (items[key] && items[key].media) {
                images.push(...items[key].media);
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
