import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn } from '../../../../../shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-wbc-routes-list',
  templateUrl: './wbc-routes-list.component.html',
  styleUrls: ['./wbc-routes-list.component.scss']
})
export class WbcRoutesListComponent implements OnInit {
  @Input() rows: any[] = [];
  @Input() height = 'calc(80vh - 100px)';
  @Input() columnMode = 'standard';
  @Input() showFilter = true;
  @Input() showNameAsLink = true;
  @Input() sorts: {prop: string, dir: 'asc'|'desc'}[] = [];
  @Input() loading = true;

  allColumns: DatatableColumn[] = [
    {
      name: 'document.namedPlace.name',
      label: 'wbc.stats.routes.name',
      width: 300,
      flexGrow: 1
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
      name: 'gathering.eventDate.begin',
      label: 'wbc.stats.route.begin'
    },
    {
      name: 'gathering.team',
      label: 'wbc.stats.route.team',
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
    },
    {
      name: 'individualCountSum',
      label: 'wbc.stats.route.individualCountSum'
    }
  ];
  columns = [];

  filterBy = '';

  @Output() onRowSelect = new EventEmitter<string>();

  @Input() set selected(selected: string[]) {
    this.columns = this.allColumns.filter(val => {
      if (val.name === 'document.namedPlace.name' && this.showNameAsLink) {
        val.cellTemplate = 'link';
      }
      return selected.indexOf(val.name) !== -1;
    })
  }

  constructor() { }

  ngOnInit() {
  }

}
