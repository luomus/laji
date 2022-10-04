import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Collection } from '../../../shared/model/Collection';
import { ICollectionCounts } from '../../../shared/service/collection.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-dataset-metadata-viewer',
  templateUrl: './dataset-metadata-viewer.component.html',
  styleUrls: ['./dataset-metadata-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataViewerComponent {
  @Input() collection$: Observable<Collection>;
  @Input() collectionCounts$: Observable<ICollectionCounts>;

  collection: Collection;
  collectionCounts: ICollectionCounts;
  dataLoading = false;
  countLoading = false;

  isInternalLink(collection) {
    return /^HR\.\d+$/g.test(collection.id);
  }
}
