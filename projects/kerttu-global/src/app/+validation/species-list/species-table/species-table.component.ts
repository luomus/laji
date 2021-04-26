import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-species-table',
  templateUrl: './species-table.component.html',
  styleUrls: ['./species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTableComponent {
  @Input() data: any[] = [];

  columns: DatatableColumn[] = [
    {
      name: 'vernacularName',
      label: 'Vernacular name'
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

  @Output() taxonSelect = new EventEmitter<string>();

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
