import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Collection } from '../../shared/model/Collection';
import { OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IdService } from '../../shared/service/id.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'laji-info-collection',
  templateUrl: './info-collection.component.html',
  styleUrls: ['./info-collection.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCollectionComponent implements OnInit, OnChanges {

  @Input() collections: Collection[];
  @Input() activeID: string;

  collection: Collection;
  idService = IdService;

  constructor(public translate: TranslateService) { }

  ngOnInit() {
    this.initActive();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeID']) {
      this.initActive();
    }
  }

  initActive() {
    if (this.activeID && this.collections) {
      this.collection = this.collections.filter(collection => collection.id === this.activeID)[0] || undefined;
    }
  }

}
