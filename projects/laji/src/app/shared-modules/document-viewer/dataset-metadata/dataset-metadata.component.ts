import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Collection } from '../../../shared/model/Collection';
import { ICollectionCounts } from '../../../shared/service/collection.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-dataset-metadata-viewer',
  templateUrl: './dataset-metadata.component.html',
  styleUrls: ['./dataset-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataComponent implements OnInit, OnChanges {
  @Input() collection$: Observable<Collection>;
  @Input() collectionCounts$: Observable<ICollectionCounts>;

  collection: Collection;
  collectionCounts: ICollectionCounts;
  dataLoading = false;
  countLoading = false;

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  isInternalLink(collection) {
    return /^HR\.\d+$/g.test(collection.id);
  }
}
