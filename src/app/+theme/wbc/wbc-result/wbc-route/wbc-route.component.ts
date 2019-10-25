import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest as ObservableCombineLatest, Subscription } from 'rxjs';
import { SEASON, WbcResultService } from '../wbc-result.service';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';

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

  season: SEASON;
  observationStats: any;

  private routeSub: Subscription;

  constructor(
    private resultService: WbcResultService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade
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
          });
      }

      if (this.season && !this.observationStats && !this.loadingObservationStats) {
        this.loadingObservationStats = true;
        this.resultService.getObservationStatsForRoute(this.id)
          .subscribe(data => {
            this.observationStats = data;
            this.loadingObservationStats = false;
            this.cd.markForCheck();
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  openViewer(fullId: string) {
    this.documentViewerFacade.showDocumentID({
      document: fullId,
      useWorldMap: false
    });
  }
}
