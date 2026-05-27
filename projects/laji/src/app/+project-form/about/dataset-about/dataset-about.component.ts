import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs';
import { components, paths } from 'projects/laji-api-client/generated/api.d';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

type Form = components['schemas']['Form'];
type WarehouseAggregateQuery = paths['/warehouse/query/unit/aggregate']['get']['parameters']['query'];

interface DatasetStats {
  count?: number;
  speciesCount?: number;
  firstLoadDateMax?: string;
}

@Component({
    selector: 'laji-dataset-about[form]',
    templateUrl: './dataset-about.component.html',
    styleUrls: ['./dataset-about.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DatasetAboutComponent implements OnChanges {
  @Input() form!: Form;

  stats$: Observable<DatasetStats>;

  private collectionIdSubject = new BehaviorSubject<string | null>(null);
  private collectionId$ = this.collectionIdSubject.asObservable();

  constructor(
    private api: LajiApiClientService
  ) {
    this.stats$ = this.collectionId$.pipe(switchMap(collectionId => {
      if (!collectionId) {
        return of({});
      }

      const query: WarehouseAggregateQuery = {
        collectionId: [collectionId].join(','),
        aggregateBy: [],
        orderBy: [],
        pageSize: 1,
        page: 1,
        onlyCount: false,
        taxonCounts: true,
      };

      return this.api.get('/warehouse/query/unit/aggregate', { query }).pipe(
        map(res => res.results[0] || {})
      );
    }));
  }

  ngOnChanges() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.collectionIdSubject.next(this.form.collectionID!);
  }
}
