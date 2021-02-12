import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SEASON, NafiBumblebeeResultService } from '../nafi-bumblebee-result.service';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';
import { LoadedElementsStore } from '../../../../../../../laji-ui/src/lib/tabs/tab-utils';

@Component({
  selector: 'laji-nafi-bumblebee-route',
  templateUrl: './nafi-bumblebee-route.component.html',
  styleUrls: ['./nafi-bumblebee-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeRouteComponent implements OnInit, OnDestroy {

  routeId: string;

  rows: any[];
  selected = ['gathering.eventDate.begin', 'count', 'individualCountSum'];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'gathering.eventDate.begin', dir: 'desc'},
  ];

  activeIndex = 0;
  loadedTabs = new LoadedElementsStore(['list', 'map']);

  loadingCensusList = false;
  loadingObservationStats = false;

  season: SEASON;
  year: number;
  observationStats: any;
  activeYear: number;
  activeSeason: SEASON;

  loading = false;
  queryKey: string;
  resultSub: Subscription;
  filterBy = '';

  private routeSub: Subscription;

  constructor(
    private resultService: NafiBumblebeeResultService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(queryParams => {
      this.routeId = queryParams['route'];
      this.season = queryParams['season'];
      this.year = queryParams['year'];
      this.cd.markForCheck();

      if ((!this.season && !this.year && !this.rows && !this.loadingCensusList) ||
         (!this.season && !this.year && this.rows)) {
        this.censusListForRoute(this.routeId);
      }

      if (this.season && !this.observationStats && !this.loadingObservationStats) {
        this.observationStatsForRoute(this.routeId);
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

  onFilterChange() {
    if (this.activeYear) {
      const queryKey = 'year:' + this.activeYear + ',season:' + this.activeSeason;
      if (this.loading && this.queryKey === queryKey) {
        return;
      }
      this.queryKey = queryKey;

      if (this.resultSub) {
        this.resultSub.unsubscribe();
      }

      this.loading = true;
      this.resultSub = this.resultService.getCensusList(this.activeYear, this.activeSeason)
        .subscribe(list => {
          this.rows = list;
          this.loading = false;
          this.cd.markForCheck();
        });
    }
  }

  setActive(newActive: number) {
    this.activeIndex = newActive;
    this.loadedTabs.load(newActive);
  }

  censusListForRoute(routeId) {
    this.loadingCensusList = true;
    this.resultService.getCensusListForRoute(routeId)
      .subscribe(censuses => {
        this.rows = censuses;
        this.loadingCensusList = false;
        this.cd.markForCheck();
      });
  }

  observationStatsForRoute(routeId) {
    this.loadingObservationStats = true;
    this.resultService.getObservationStatsForRoute(routeId)
      .subscribe(data => {
        this.observationStats = data;
        this.loadingObservationStats = false;
        this.cd.markForCheck();
      });
  }
}
