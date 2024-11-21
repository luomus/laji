import {Component, EventEmitter, Input, NgZone, OnChanges, Output, TemplateRef, ViewChild} from '@angular/core';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { ActivatedRoute, Router } from '@angular/router';
import { IdService } from '../../../../shared/service/id.service';
import { ColumnMode } from '@achimha/ngx-datatable';

@Component({
  selector: 'laji-routes-list',
  templateUrl: './routes-list.component.html',
  styleUrls: ['./routes-list.component.scss']
})
export class RoutesListComponent implements OnChanges {
  @Input() rows: any[] | undefined = [];
  @Input() height = 'calc(80vh - 100px)';
  @Input() columnMode: ColumnMode | keyof typeof ColumnMode = 'standard';
  @Input() showFilter = true;
  @Input() showNameAsLink = true;
  @Input() countLabel?: string;
  @Input() sorts: {prop: string; dir: 'asc'|'desc'}[] = [];
  @Input() loading = true;
  @Input() selected: string[] = [];

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
      name: 'document.modifiedDate',
      label: 'wbc.stats.route.modifiedDate'
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
  columns: DatatableColumn[] = [];

  filterBy = '';

  @Output() rowSelect = new EventEmitter<string>();

  @ViewChild('routeLink', { static: true }) routeLinkTpl!: TemplateRef<any>;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    protected route: ActivatedRoute
  ) { }

  ngOnChanges() {
    this.columns = this.allColumns.filter(val => {
      if (val.name === 'document.namedPlace.name') {
        if (this.showNameAsLink) {
          val.cellTemplate = this.routeLinkTpl;
        } else {
          val.cellTemplate = undefined;
        }
      } else if (val.name === 'count') {
        val.label = this.countLabel || 'wbc.stats.routes.count';
      }
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      return this.selected.indexOf(val.name!) !== -1;
    });
  }

  onRouteLinkClick(e: Event, uri: string) {
    e.preventDefault();
    e.stopPropagation();

    this.ngZone.run(() => {
      this.router.navigate([], {queryParams: {route: IdService.getId(uri)}, queryParamsHandling: 'merge'});
    });
  }

}
