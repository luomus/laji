import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SEASON, NafiBumblebeeResultService } from '../nafi-bumblebee-result.service';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';
import { LoadedElementsStore } from '../../../../../../../laji-ui/src/lib/tabs/tab-utils';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'laji-nafi-bumblebee-route',
  templateUrl: './nafi-bumblebee-route.component.html',
  styleUrls: ['./nafi-bumblebee-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeRouteComponent implements OnInit, OnDestroy {

  routeId: string;

  rows: any;
  selected = ['unit.linkings.taxon.scientificName', 'individualCountSum'];
  defaultSelected = ['unit.linkings.taxon.scientificName', 'individualCountSum'];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'unit.linkings.taxon.scientificName', dir: 'asc'}
  ];

  activeIndex = 0;
  loadedTabs = new LoadedElementsStore(['list', 'map']);

  loadingCensusList = false;
  loadingObservationStats = false;

  date: string;
  year: number;
  observationStats = [{'dataSets': []}];
  activeYear: number;
  activeDate: string;
  onlySections: boolean;

  loading = false;
  queryKey: string;
  resultSub: Subscription;
  filterBy = '';

  private routeSub: Subscription;

  constructor(
    private resultService: NafiBumblebeeResultService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(queryParams => {
      this.routeId = queryParams['route'];
      this.date = queryParams['date'];
      this.year = queryParams['year'];
      this.onlySections = this.date ? true : (queryParams['onlySections'] ? JSON.parse(queryParams['onlySections']) : true);

      if (!this.activeYear) {
        this.censusListForRoute(this.routeId);
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
      const queryKey = 'year:' + this.activeYear + ',date:' + this.activeDate + ',onlySections:' + this.onlySections;
      if (this.loading && this.queryKey === queryKey) {
        return;
      }
      this.queryKey = queryKey;

      if (this.resultSub) {
        this.resultSub.unsubscribe();
      }

      this.loading = true;
      this.resultSub = this.resultService.getUnitStats(this.activeYear, this.activeDate, this.routeId, this.activeDate ? true : typeof this.onlySections === 'string'
      ? JSON.parse(this.onlySections) : this.onlySections)
        .subscribe(list => {
          this.observationStats = list;
          this.loading = false;
          this.selected = [...this.defaultSelected, this.onlySections ?
            'gathering.gatheringSection' : 'gathering.conversions.year', 'gathering.conversions.month', 'gathering.conversions.day'];
          this.sorts = [{prop: 'unit.linkings.taxon.scientificName', dir: 'asc'}, {prop: 'total', dir: 'desc'}];
          this.cd.markForCheck();
        });
    }
  }

  censusListForRoute(routeId) {
    this.loadingCensusList = true;
    this.resultService.getUnitStats(this.activeYear, this.activeDate, routeId, this.activeDate ? true : typeof this.onlySections === 'string'
    ? JSON.parse(this.onlySections) : this.onlySections)
      .subscribe(censuses => {
        this.observationStats = censuses;
        this.loadingCensusList = false;
        this.selected = [...this.defaultSelected, this.onlySections ?
          'gathering.gatheringSection' : 'gathering.conversions.year', 'gathering.conversions.month', 'gathering.conversions.day'];
        this.sorts = [{prop: 'total', dir: 'desc'}, {prop: 'unit.linkings.taxon.scientificName', dir: 'asc'}];
        this.cd.markForCheck();
      });
  }

}
