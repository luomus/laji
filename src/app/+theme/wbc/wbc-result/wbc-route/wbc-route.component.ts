import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest as ObservableCombineLatest } from 'rxjs';
import { WbcResultService, SEASON } from '../wbc-result.service';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { ModalDirective } from 'ngx-bootstrap';
import { IdService } from '../../../../shared/service/id.service';

@Component({
  selector: 'laji-wbc-route',
  templateUrl: './wbc-route.component.html',
  styleUrls: ['./wbc-route.component.css']
})
export class WbcRouteComponent implements OnInit, OnDestroy {
  id: string;
  rows: any[];
  columns: DatatableColumn[] = [
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
      name: 'count',
      label: 'wbc.stats.route.count'
    },
    {
      name: 'individualCountSum',
      label: 'wbc.stats.route.individualCountSum'
    }
  ];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'gathering.eventData.begin', dir: 'asc'},
  ];
  loading = false;

  documentModalVisible = false;
  shownDocument: string;

  season: SEASON;
  observationStats: any;

  @ViewChild('documentModal') public modal: ModalDirective;

  private routeSub: Subscription;

  constructor(
    private resultService: WbcResultService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.routeSub = ObservableCombineLatest(
      this.route.params,
      this.route.queryParams
    ).subscribe(params => {
      this.id = params[0]['id'];
      this.season = params[1]['season'];
      this.cd.markForCheck();

      if (!this.season && !this.rows && !this.loading) {
        this.loading = true;
        this.resultService.getCensusListForRoute(this.id)
          .subscribe(censuses => {
            this.rows = censuses;
            this.loading = false;
            this.cd.markForCheck();
          })
      } else if (!this.observationStats) {
        this.resultService.getObservationStatsForRoute(this.id)
          .subscribe(data => {
            this.observationStats = data;
            this.cd.markForCheck();
          })
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  openViewer(fullId: string) {
    this.shownDocument = IdService.getId(fullId);
    this.modal.show();
  }
}
