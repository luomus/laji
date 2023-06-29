import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PagedResult } from '../../../../../../laji/src/app/shared/model/PagedResult';
import { IGlobalAnnotationResponse } from '../../../kerttu-global-shared/models';
import { DatatableColumn, DatatableSort } from '../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'bsg-identification-history-table',
  templateUrl: './identification-history-table.component.html',
  styleUrls: ['./identification-history-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationHistoryTableComponent implements OnChanges {
  @Input() data: PagedResult<IGlobalAnnotationResponse>;
  @Input() loading = false;

  columns: DatatableColumn[] = [
    {
      name: 'annotation.created',
      label: 'created',
      cellTemplate: 'date'
    },
    {
      name: 'recording.site.name',
      label: 'site.name',
      width: 70
    }
  ];

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<DatatableSort[]>();

  ngOnChanges() {
    console.log(this.data);
  }
}
