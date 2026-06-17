import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  IdentificationHistoryResponse
} from '../../bsg-shared/models';
import { DatatableColumn, DatatableSort } from '../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';

@Component({
    selector: 'bsg-annotation-box-table',
    templateUrl: './annotation-box-table.component.html',
    styleUrls: ['./annotation-box-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AnnotationBoxTableComponent implements OnInit {
  @ViewChild('xenoCantoIdTpl', { static: true }) private xenoCantoIdTemplate!: TemplateRef<any>;
  @ViewChild('speciesListTpl', { static: true }) private speciesListTemplate!: TemplateRef<any>;
  @ViewChild('boxCountTpl', { static: true }) private boxCountTemplate!: TemplateRef<any>;

  @Input() data?: PagedResult<IdentificationHistoryResponse>;
  @Input() loading = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<DatatableSort[]>();

  columns: DatatableColumn[] = [];

  ngOnInit() {
    this.columns = [
      {
        name: 'annotation.created',
        label: 'history.created',
        cellTemplate: 'date',
        width: 90
      },
      {
        name: 'annotation.edited',
        label: 'history.edited',
        cellTemplate: 'date',
        width: 90
      },
      {
        name: 'recording.xenoCantoId',
        label: 'xenoCantoExport.xenoCantoId',
        cellTemplate: this.xenoCantoIdTemplate,
        width: 70
      },
      {
        name: 'annotation.species',
        label: 'history.species',
        cellTemplate: this.speciesListTemplate,
        width: 300,
        sortable: false
      },
      {
        name: 'annotation.species',
        label: 'xenoCantoExport.boxCount',
        cellTemplate: this.boxCountTemplate,
        width: 70,
        sortable: false
      }
    ];
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  onSortChange(sorts: DatatableSort[]) {
    this.sortChange.emit(sorts);
  }
}
