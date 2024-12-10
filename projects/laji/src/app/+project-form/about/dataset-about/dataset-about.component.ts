import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { Form } from '../../../shared/model/Form';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

interface DatasetStats {
  count?: number;
  speciesCount?: number;
  firstLoadDateMax?: string;
}

@Component({
  selector: 'laji-dataset-about[form]',
  templateUrl: './dataset-about.component.html',
  styleUrls: ['./dataset-about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetAboutComponent implements OnChanges {
  @Input() form!: Form.SchemaForm;

  stats$: Observable<DatasetStats>;

  private collectionIdSubject = new BehaviorSubject<string | null>(null);
  private collectionId$ = this.collectionIdSubject.asObservable();

  constructor(
    private warehouseService: WarehouseApi
  ) {
    this.stats$ = this.collectionId$.pipe(switchMap(collectionId => {
      if (!collectionId) {
        return of({});
      }

      const query: WarehouseQueryInterface = {
        collectionId: [collectionId],
        taxonCounts: true
      };
      return this.warehouseService.warehouseQueryAggregateGet(query, [], [], 1, 1, false, false).pipe(
        map(res => res.results[0] || {})
      );
    }));
  }

  ngOnChanges() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.collectionIdSubject.next(this.form.collectionID!);
  }
}
