import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn } from 'projects/laji/src/app/shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-species-table',
  templateUrl: './species-table.component.html',
  styleUrls: ['./species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTableComponent implements OnInit {
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

  constructor() { }

  ngOnInit(): void {
  }
}
