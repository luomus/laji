import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ICollectionCounts } from '../../../shared/service/collection.service';
import { Observable } from 'rxjs';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Collection = components['schemas']['SensitiveCollection'];

@Component({
    selector: 'laji-dataset-metadata-viewer',
    templateUrl: './dataset-metadata-viewer.component.html',
    styleUrls: ['./dataset-metadata-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DatasetMetadataViewerComponent {
  @Input() collection$!: Observable<Collection>;
  @Input() collectionCounts$!: Observable<ICollectionCounts>;

  dataLoading = false;
  countLoading = false;

  isInternalLink(collection: Collection) {
    return /^HR\.\d+$/g.test(collection.id);
  }
}
