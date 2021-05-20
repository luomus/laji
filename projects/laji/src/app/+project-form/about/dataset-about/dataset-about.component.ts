import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { Form } from '../../../shared/model/Form';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

interface DatasetStats {
  count?: number;
  speciesCount?: number;
  firstLoadDateMax?: string;
}

@Component({
  selector: 'laji-dataset-about',
  templateUrl: './dataset-about.component.html',
  styleUrls: ['./dataset-about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetAboutComponent implements OnChanges {
  @Input() form: Form.SchemaForm;

  stats$?: Observable<DatasetStats>;

  constructor(
    private warehouseService: WarehouseApi
  ) {}

  ngOnChanges() {
    if (this.form?.collectionID) {
      const query: WarehouseQueryInterface = {
        collectionId: [this.form.collectionID],
        taxonCounts: true
      };
      this.stats$ = this.warehouseService.warehouseQueryAggregateGet(query, [], [], 1, 1, false, false).pipe(
        map(res => res.results[0] || {})
      );
    } else {
      this.stats$ = null;
    }
  }
}
