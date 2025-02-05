import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type Dataset = components['schemas']['Dataset'];

@Component({
  templateUrl: './trait-db-datasets.component.html',
  styleUrls: ['./trait-db-datasets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDatasetsComponent implements OnInit {
  datasets$!: Observable<Dataset[]>;

  constructor(private api: LajiApiClientBService) {}

  ngOnInit() {
    this.datasets$ = this.api.fetch('/trait/datasets', 'get', {}).pipe(
      map(datasets => datasets.filter(dataset => dataset.published))
    );
  }
}

