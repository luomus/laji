import { ChangeDetectorRef, Component, OnDestroy, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SykeInsectResultService } from '../syke-insect-result.service';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';

@Component({
  selector: 'laji-syke-insect-route',
  templateUrl: './syke-insect-route.component.html',
  styleUrls: ['./syke-insect-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SykeInsectRouteComponent implements OnInit, OnDestroy {

  @Input() collectionId!: string;

  routeId!: string;

  rows: any;
  selected = ['unit.linkings.taxon.scientificName', 'individualCountSum'];
  defaultSelected = ['unit.linkings.taxon.scientificName', 'individualCountSum'];
  sorts: {prop: string; dir: 'asc'|'desc'}[] = [
    {prop: 'unit.linkings.taxon.scientificName', dir: 'asc'}
  ];

  observationStats: {
    dataSets?: any[];
    yearsDays?: any[];
    taxonSets?: any[];
  }[] = [{dataSets: []}];
  activeYear?: number;
  activeDate?: string;
  onlySections!: boolean;

  loading = false;
  queryKey!: string;
  resultSub!: Subscription;
  filterBy = '';

  private routeSub!: Subscription;

  constructor(
    private resultService: SykeInsectResultService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade,
  ) { }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(queryParams => {
      this.routeId = queryParams['route'];
      this.activeDate = queryParams['date'];
      this.activeYear = queryParams['year'];
      this.onlySections = this.activeDate ? true : (queryParams['onlySections'] ? JSON.parse(queryParams['onlySections']) : true);

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
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      this.resultSub = this.resultService.getUnitStats(this.activeYear, this.activeDate!, this.routeId, this.activeDate ? true : typeof this.onlySections === 'string'
      ? JSON.parse(this.onlySections) : this.onlySections, this.collectionId)
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

  censusListForRoute(routeId: string) {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    this.resultService.getUnitStats(this.activeYear, this.activeDate!, routeId, this.activeDate ? true : typeof this.onlySections === 'string'
    ? JSON.parse(this.onlySections) : this.onlySections, this.collectionId)
      .subscribe(censuses => {
        this.observationStats = censuses;
        this.selected = [...this.defaultSelected, this.onlySections ?
          'gathering.gatheringSection' : 'gathering.conversions.year', 'gathering.conversions.month', 'gathering.conversions.day'];
        this.sorts = [{prop: 'total', dir: 'desc'}, {prop: 'unit.linkings.taxon.scientificName', dir: 'asc'}];
        this.cd.markForCheck();
      });
  }

}
