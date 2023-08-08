import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { PagedResult } from '../../../../../../laji/src/app/shared/model/PagedResult';
import { IGlobalAnnotationResponse } from '../../../kerttu-global-shared/models';
import { DatatableColumn, DatatableSort } from '../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'bsg-identification-history-table',
  templateUrl: './identification-history-table.component.html',
  styleUrls: ['./identification-history-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationHistoryTableComponent implements OnInit, OnChanges {
  @ViewChild('speciesListTpl', { static: true }) public speciesListTemplate: TemplateRef<any>;

  @Input() data: PagedResult<IGlobalAnnotationResponse>;
  @Input() loading = false;

  columns: DatatableColumn[] = [];

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<DatatableSort[]>();

  ngOnInit() {
    this.columns = [
      {
        name: 'created',
        label: 'created',
        cellTemplate: 'date'
      },
      {
        name: 'site',
        label: 'site.name',
        width: 70
      },
      {
        name: 'species',
        label: 'species',
        cellTemplate: this.speciesListTemplate,
        width: 150
      }
    ];
  }

  ngOnChanges() {
    console.log(this.data);
  }
}
