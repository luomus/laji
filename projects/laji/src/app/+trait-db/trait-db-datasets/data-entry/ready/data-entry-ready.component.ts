import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { BehaviorSubject } from 'rxjs';

type Dataset = components['schemas']['Dataset'];

interface Loading {
  _tag: 'loading';
}

interface Ready {
  _tag: 'ready';
  dataset: Dataset;
}

interface Uploading {
  _tag: 'uploading';
}

interface Error {
  _tag: 'error';
  msg: string;
}

type DatasetState = Loading | Ready | Uploading | Error;

@Component({
  selector: 'laji-trait-db-data-entry-ready',
  templateUrl: './data-entry-ready.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEntryReadyComponent implements OnChanges {
  @Input({ required: true }) datasetId!: string;

  state$ = new BehaviorSubject<DatasetState>({ _tag: 'loading' });

  constructor(private api: LajiApiClientBService, private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges) {
    this.api.fetch('/trait/datasets/{id}', 'get', { path: { id: this.datasetId } })
      .subscribe(
        dataset => this.state$.next({  _tag: 'ready', dataset }),
        err => this.state$.next({ _tag: 'error', msg: err })
      );
  }

  onPublishDataset(dataset: Dataset) {
    const d = { ...dataset };
    d.published = true;
    this.state$.next({ _tag: 'uploading' });
    this.api.fetch('/trait/datasets/{id}', 'put', { path: { id: dataset.id }, query: { personToken: this.userService.getToken() } }, d)
      .subscribe(
        res => this.state$.next({  _tag: 'ready', dataset: res }),
        err => this.state$.next({  _tag: 'error', msg: err })
      );
  }
}

