import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'laji-trait-db-data-entry-ready',
  templateUrl: './data-entry-ready.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEntryReadyComponent implements OnChanges {
  @Input({ required: true }) datasetId!: string;

  dataset$ = new Subject<components['schemas']['Dataset']>();

  constructor(private api: LajiApiClientBService) {}

  ngOnChanges(changes: SimpleChanges) {
    this.api.fetch('/trait/datasets/{id}', 'get', { path: { id: this.datasetId } })
      .subscribe(dataset => this.dataset$.next(dataset));
  }

  onPublishDataset() {
    console.log('TODO!');
  }
}

