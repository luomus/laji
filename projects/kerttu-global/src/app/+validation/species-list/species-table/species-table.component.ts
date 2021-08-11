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
      label: 'speciesList.column.commonName'
    },
    {
      name: 'scientificName',
      label: 'speciesList.column.scientificName'
    },
    {
      name: 'userValidations',
      label: 'speciesList.column.userValidations',
      width: 30
    },
    {
      name: 'userHasValidated',
      label: 'speciesList.column.userHasValidated',
      cellTemplate: 'booleanCheck',
      width: 30
    }
  ];

  @Output() taxonSelect = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<DatatableSort[]>();

  onRowSelect(row: any) {
    this.taxonSelect.emit(row.id);
  }

  getRowClass(row: any): string {
    const rowClasses = ['link'];

    if (!row.userValidations) {
      rowClasses.push('red-row');
    } else if (row.userValidations === 1 || row.userValidations === 2) {
      rowClasses.push('yellow-row');
    }

    return rowClasses.join(' ');
  }
}
