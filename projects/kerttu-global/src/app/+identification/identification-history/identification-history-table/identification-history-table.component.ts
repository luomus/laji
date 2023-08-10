import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { PagedResult } from '../../../../../../laji/src/app/shared/model/PagedResult';
import { AnnotationStatusEnum, IIdentificationHistoryResponse } from '../../../kerttu-global-shared/models';
import { DatatableColumn, DatatableSort } from '../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'bsg-identification-history-table',
  templateUrl: './identification-history-table.component.html',
  styleUrls: ['./identification-history-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationHistoryTableComponent implements OnInit {
  @ViewChild('speciesListTpl', { static: true }) public speciesListTemplate: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) public statusTemplate: TemplateRef<any>;

  @Input() data: PagedResult<IIdentificationHistoryResponse>;
  @Input() loading = false;

  columns: DatatableColumn[] = [];

  annotationStatusEnum = AnnotationStatusEnum;

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<DatatableSort[]>();
  @Output() rowSelect = new EventEmitter<IIdentificationHistoryResponse>();

  ngOnInit() {
    this.columns = [
      {
        name: 'annotation.created',
        label: 'history.created',
        cellTemplate: 'date',
        width: 70
      },
      {
        name: 'recording.site.name',
        label: 'history.site',
        width: 70
      },
      {
        name: 'annotation.species',
        label: 'history.species',
        cellTemplate: this.speciesListTemplate,
        width: 500,
        sortable: false
      },
      {
        name: 'annotation.status',
        label: 'history.status',
        cellTemplate: this.statusTemplate,
        width: 50
      }
    ];
  }
}
