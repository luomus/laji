import {Component, EventEmitter, ChangeDetectionStrategy,
Input, NgZone, OnChanges, Output, TemplateRef, ViewChild} from '@angular/core';
import { DatatableColumn } from '../../../../../shared-modules/datatable/model/datatable-column';
import { ActivatedRoute, Router } from '@angular/router';
import { IdService } from '../../../../../shared/service/id.service';


@Component({
  selector: 'laji-nafi-bumblebee-routes-list',
  templateUrl: './nafi-bumblebee-routes-list.component.html',
  styleUrls: ['./nafi-bumblebee-routes-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeRoutesListComponent implements OnChanges {

  @Input() rows: any[] = [];
  @Input() height = 'calc(80vh - 100px)';
  @Input() columnMode = 'standard';
  @Input() showFilter = true;
  @Input() showNameAsLink = true;
  @Input() countLabel: string;
  @Input() sorts: {prop: string, dir: 'asc'|'desc'}[] = [];
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
      label: 'wbc.stats.routes.municipalityDisplayName',
      width: 300
    },
    {
      name: 'unit.linkings.taxon.scientificName',
      label: 'taxonomy.scientific.name'
    },
    {
      name: 'gathering.eventDate.begin',
      label: 'wbc.stats.route.begin'
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
    },
    {
      name: 'gathering.conversions.year',
      label: 'quality.mostActive.year'
    },
    {
      name: 'gathering.gatheringSection',
      label: 'gathering.section'
    },
  ];
  columns = [];

  filterBy = '';

  @Output() rowSelect = new EventEmitter<string>();

  @ViewChild('routeLink', { static: true }) routeLinkTpl: TemplateRef<any>;

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
      return this.selected.indexOf(val.name) !== -1;
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
