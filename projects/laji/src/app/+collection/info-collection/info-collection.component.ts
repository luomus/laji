import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Collection } from '../../shared/model/Collection';
import { TranslateService } from '@ngx-translate/core';
import { IdService } from '../../shared/service/id.service';
import { Title } from '@angular/platform-browser';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';

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

  constructor(
    public translate: TranslateService,
    private title: Title
  ) { }

  ngOnInit() {
    this.initActive();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeID && !changes.activeID.isFirstChange()) {
      this.initActive();
    }
  }

  initActive() {
    if (this.activeID && this.collections) {
      this.collection = this.collections.filter(collection => collection.id === this.activeID)[0] || undefined;
      if (this.collection) {
        this.title.setTitle(
          MultiLangService.getValue(<any>this.collection.collectionName, this.translate.currentLang) +
          ' | ' +
          this.title.getTitle()
        );
      }
    }
  }

}
