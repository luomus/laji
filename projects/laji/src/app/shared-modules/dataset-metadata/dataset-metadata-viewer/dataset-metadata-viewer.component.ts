import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ICollection, ICollectionCounts } from '../../../shared/service/collection.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-dataset-metadata-viewer',
  templateUrl: './dataset-metadata-viewer.component.html',
  styleUrls: ['./dataset-metadata-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataViewerComponent {
  @Input() collection$!: Observable<ICollection>;
  @Input() collectionCounts$!: Observable<ICollectionCounts>;

  dataLoading = false;
  countLoading = false;

  isInternalLink(collection: ICollection) {
    return /^HR\.\d+$/g.test(collection.id);
  }
}
