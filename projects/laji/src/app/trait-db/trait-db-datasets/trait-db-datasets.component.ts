import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { components } from 'projects/laji-api-client/generated/api';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

export type Dataset = components['schemas']['LajiBackendDataset'];

@Component({
    templateUrl: './trait-db-datasets.component.html',
    styleUrls: ['./trait-db-datasets.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TraitDbDatasetsComponent implements OnInit {
  datasets$!: Observable<Dataset[]>;

  constructor(private api: LajiApiClientService) {}

  ngOnInit() {
    this.datasets$ = this.api.fetch('/trait/datasets', 'get', {}).pipe(
      map(datasets => datasets.filter(dataset => dataset.published))
    );
  }
}
