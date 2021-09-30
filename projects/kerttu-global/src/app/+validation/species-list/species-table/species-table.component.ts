import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';
import { DatatableColumn, DatatableSort } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';
import { IGlobalSpeciesListResult } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-table',
  templateUrl: './species-table.component.html',
  styleUrls: ['./species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTableComponent implements OnChanges {
  @Input() data: IGlobalSpeciesListResult = {results: [], currentPage: 0, total: 0, pageSize: 0};
  @Input() loading = false;

  private defaultColumns: DatatableColumn[] = [
    {
      name: 'commonName',
      label: 'speciesList.column.commonName'
    },
    {
      name: 'scientificName',
      label: 'speciesList.column.scientificName'
    },
    {
      name: 'validationCount',
      label: 'speciesList.column.validationCount',
      width: 30
    },
    {
      name: 'versionCount',
      label: 'speciesList.column.versionCount',
      width: 30
    },
    {
      name: 'userHasValidated',
      label: 'speciesList.column.userHasValidated',
      cellTemplate: 'booleanCheck',
      width: 30
    }
  ];
  columns = this.defaultColumns;

  @Output() taxonSelect = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<DatatableSort[]>();

  @ViewChild('exclamation', { static: true }) exclamationTpl: TemplateRef<any>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.previousValue?.hasModifications !== this.data?.hasModifications) {
      if (this.data?.hasModifications) {
        this.columns = [
        {
          name: 'hasModifications',
          label: 'speciesList.column.hasModifications',
          width: 30,
          cellTemplate: this.exclamationTpl
        }, ...this.defaultColumns];
      } else {
        this.columns = this.defaultColumns;
      }
    }
  }

  onRowSelect(row: any) {
    this.taxonSelect.emit(row.id);
  }

  getRowClass(row: any): string {
    const rowClasses = ['link'];

    if (!row.validationCount) {
      rowClasses.push('red-row');
    } else if (row.validationCount === 1 || row.validationCount === 2) {
      rowClasses.push('yellow-row');
    }

    return rowClasses.join(' ');
  }
}
