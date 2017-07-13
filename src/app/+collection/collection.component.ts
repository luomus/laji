import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CollectionApi } from '../shared/api/CollectionApi';
import { ActivatedRoute } from '@angular/router';
import { IdService } from '../shared/service/id.service';
import { Collection } from '../shared/model/Collection';
import { TranslateService } from '@ngx-translate/core';
import { MultiLangService } from '../shared/service/multi-lang.service';

@Component({
  selector: 'laji-collection',
  templateUrl: './collection.component.html',
  styles: [`
    :host {
      margin-bottom: 20px;
    }
    .collection-filter {
      margin-bottom: 10px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionComponent implements OnInit {
  collections$;
  filter;
  activeCollection: string;

  constructor(
    private collectionApi: CollectionApi,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {

  }

  ngOnInit() {
    this.initCollectionTree();
    this.route.queryParams.subscribe(params => {
      this.activeCollection = params['uri'] ? IdService.getId(params['uri']) : '';
    });
  }

  initCollectionTree() {
    this.collections$ = this.collectionApi
      .findAll('multi', undefined, '1', '10000')
      .map(result => result.results)
      .map(collections => collections.map((collection: Collection) => {
        collection.onlineUrl = this.emptyMultiLang(collection.onlineUrl);
        return collection;
      }))
      .map(collections => {
        collections.sort(this.compare.bind(this));
        return collections;
      });
  }

  private emptyMultiLang(obj) {
    if (!obj) {
      return obj;
    }
    if (obj.en === '' && obj.fi === '' && obj.sv === '') {
      return undefined;
    }
    return obj;
  }


  private compare(a: Collection, b: Collection) {
    const compA = MultiLangService.getValue(<any>a.longName, this.translate.currentLang);
    const compB = MultiLangService.getValue(<any>b.longName, this.translate.currentLang);
    if (compA < compB) {
      return -1;
    }
    if (compA > compB) {
      return 1;
    }
    return 0;
  }

}
