import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn } from '../../../../../shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-wbc-routes-list',
  templateUrl: './wbc-routes-list.component.html',
  styleUrls: ['./wbc-routes-list.component.scss']
})
export class WbcRoutesListComponent implements OnInit {
  @Input() rows: any[] = [];

  columns: DatatableColumn[] = [
    {
      name: 'document.namedPlace.name',
      label: 'wbc.stats.routes.name',
      cellTemplate: 'link',
      width: 300
    },
    {
      name: 'document.namedPlace.municipalityDisplayName',
      label: 'wbc.stats.routes.municipalityDisplayName'
    },
    {
      name: 'document.namedPlace.birdAssociationAreaDisplayName',
      label: 'wbc.stats.routes.birdAssociationAreaDisplayName',
      width: 300

    },
    {
      name: 'oldestRecord',
      label: 'wbc.stats.routes.oldestRecord'
    },
    {
      name: 'newestRecord',
      label: 'wbc.stats.routes.newestRecord'
    },
    {
      name: 'count',
      label: 'wbc.stats.routes.count'
    }
  ];

  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'document.namedPlace.birdAssociationAreaDisplayName', dir: 'asc'},
    {prop: 'document.namedPlace.name', dir: 'asc'}
  ];

  filterBy = '';

  @Output() onRouteSelect = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}
