import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn, DatatableSort } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IKerttuSpecies } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-table',
  templateUrl: './species-table.component.html',
  styleUrls: ['./species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTableComponent {
  @Input() data: PagedResult<IKerttuSpecies> = {results: [], currentPage: 0, total: 0, pageSize: 0};
  @Input() loading = false;

  columns: DatatableColumn[] = [
    {
      name: 'commonName',
      label: 'Common name'
    },
    {
      name: 'scientificName',
      label: 'Scientific name'
    },
    {
      name: 'userValidations',
      label: 'User validations'
    }
  ];

  @Output() taxonSelect = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<DatatableSort[]>();

  getRowClass(row: any) {
    let rowClass = 'link ';
    if (!row.userValidations) {
      rowClass += 'red-row';
    } else if (row.userValidations === 1 || row.userValidations === 2) {
      rowClass += 'yellow-row';
    }
    return rowClass;
  }
}
