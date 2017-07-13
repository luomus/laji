import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Collection } from '../../shared/model/Collection';
import { TranslateService } from '@ngx-translate/core';
import { IdService } from '../../shared/service/id.service';

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
