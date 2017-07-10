import { Component } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { OnInit } from '@angular/core';
import { CollectionApi } from '../shared/api/CollectionApi';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-collection',
  templateUrl: './collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionComponent implements OnInit {
  collections$;
  filter;

  constructor(
    private collectionApi: CollectionApi,
    private translate: TranslateService
  ) {

  }

  ngOnInit() {
    this.initCollectionTree();
  }

  initCollectionTree() {
    this.collections$ = this.collectionApi
      .findAll(this.translate.currentLang, undefined, '1', '10000')
      .map(result => result.results);
  }

}
