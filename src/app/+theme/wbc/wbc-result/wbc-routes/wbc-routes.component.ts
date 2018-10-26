import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { WbcResultService } from '../wbc-result.service';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { IdService } from '../../../../shared/service/id.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';

@Component({
  selector: 'laji-wbc-routes',
  templateUrl: './wbc-routes.component.html',
  styleUrls: ['./wbc-routes.component.css']
})
export class WbcRoutesComponent implements OnInit {
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
  rows: any[] = [];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'document.namedPlace.birdAssociationAreaDisplayName', dir: 'asc'},
    {prop: 'document.namedPlace.name', dir: 'asc'}
  ];

  loading = false;

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.resultService.getRouteList()
      .subscribe(routes => {
        this.rows = routes;
        this.loading = false;
        this.cd.markForCheck();
      })
  }

  routeSelect(fullId: string) {
    const id = IdService.getId(fullId);
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/stats/routes/' + id])
    );
  }
}
