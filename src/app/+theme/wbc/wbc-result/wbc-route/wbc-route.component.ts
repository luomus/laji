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
  selected = ['gathering.eventDate.begin', 'gathering.team', 'count', 'individualCountSum'];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'gathering.eventDate.begin', dir: 'desc'},
  ];

  loadingCensusList = false;
  loadingObservationStats = false;

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

      if (!this.season && !this.rows && !this.loadingCensusList) {
        this.loadingCensusList = true;
        this.resultService.getCensusListForRoute(this.id)
          .subscribe(censuses => {
            this.rows = censuses;
            this.loadingCensusList = false;
            this.cd.markForCheck();
          })
      }

      if (this.season && !this.observationStats && !this.loadingObservationStats) {
        this.loadingObservationStats = true;
        this.resultService.getObservationStatsForRoute(this.id)
          .subscribe(data => {
            this.observationStats = data;
            this.loadingObservationStats = false;
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
