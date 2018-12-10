import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AreaType } from '../../../../shared/service/area.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of as ObservableOf, Subscription } from 'rxjs';
import { ObservationListService } from '../../../../shared-modules/observation-result/service/observation-list.service';
import { Logger } from '../../../../shared/logger';
import { combineLatest, map, tap } from 'rxjs/operators';
import { PagedResult } from '../../../../shared/model/PagedResult';
import { WarehouseApi } from '../../../../shared/api/WarehouseApi';

@Component({
  selector: 'laji-line-transect-result-chart',
  templateUrl: './line-transect-result-chart.component.html',
  styleUrls: ['./line-transect-result-chart.component.css']
})
export class LineTransectResultChartComponent implements OnInit, OnDestroy {

  @Input() informalTaxonGroup: string;
  @Input() defaultTaxonId: string;
  @Input() collectionId: string;
  @Input() lang = 'fi';

  loading = false;
  areaTypes = AreaType;
  birdAssociationAreas: string[] = [];
  currentArea;
  taxon: string;
  taxonId: string;
  fromYear = 2006;
  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  private yearLineLengths: any;
  minYear: number;
  maxYear: number;
  colorScheme = {
    domain: ['steelblue']
  };
  line: {name: string, series: {name: string, value: number}[]}[] = [];
  private afterBothFetched: any;
  private subQuery: Subscription;
  private fetchSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultService: ObservationListService,
    private warehouseApi: WarehouseApi,
    private logger: Logger,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe((params) => {
      const {taxonId, birdAssociationAreas, fromYear} = params;
      this.taxonId = taxonId;
      this.birdAssociationAreas = (birdAssociationAreas || '').split(',');
      const parsedFromYear = parseInt(fromYear, 10);
      this.fromYear = !isNaN(parsedFromYear) ? parsedFromYear : fromYear;
      this.fetch();
    });
  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

  private navigate(taxonId: string, birdAssociationAreas: string[], fromYear: number) {
    this.router.navigate([], {queryParams: {
      taxonId: taxonId,
      birdAssociationAreas: birdAssociationAreas.join(','),
      fromYear: fromYear || ''
    }});
  }

  private update() {
    this.navigate(this.taxonId, this.birdAssociationAreas, this.fromYear);
    this.fetch();
  }

  private fetch() {
    this.loading = true;

    const currentSearch = this.birdAssociationAreas.join(',');

    this.fetchSub = this.warehouseApi.warehouseQueryStatisticsGet(
      {
        collectionId: [this.collectionId],
        birdAssociationAreaId: this.birdAssociationAreas,
        taxonId: [this.taxonId || this.defaultTaxonId],
        yearMonth: this.fromYear ? this.fromYearToYearMonth(this.fromYear) : undefined,
        pairCounts: true,
        includeSubCollections: false
      },
      ['gathering.conversions.year'],
      ['gathering.conversions.year DESC'],
      100,
      1
    ).pipe(
      combineLatest(currentSearch !== this.currentArea ? this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        {
          collectionId: [this.collectionId],
          includeSubCollections: false,
          birdAssociationAreaId: this.birdAssociationAreas
        },
        ['gathering.conversions.year'],
        ['gathering.conversions.year DESC'],
        100,
        1,
        false,
        false
      ).pipe(
          tap(data => {
            this.currentArea = currentSearch;
            const yearLineLengths = {};
            data.results.forEach(result => {
              const {'gathering.conversions.year': year} = result.aggregateBy;
              if (!year) {
                return;
              }
              yearLineLengths[year] = result.lineLengthSum / 1000;
            });
            this.yearLineLengths = yearLineLengths;
          })
        ) : ObservableOf(null)
      ),
      map(value => value[0])
    )
      .subscribe(data => {
        this.result = data;
        const yearsToPairCounts = {};
        data.results.forEach(result => {
          const {'gathering.conversions.year': year} = result.aggregateBy;
          if (!year) {
            return;
          }
          yearsToPairCounts[year] = result.pairCountSum;
        });
        this.afterBothFetched = () => {
          const resultsYears = Object.keys(yearsToPairCounts);
          const years = this.fromYearToYearMonth(resultsYears[0]);
          this.line = [{name: 'Parim./km', series: years.map(year => {
            const value = yearsToPairCounts[year] && this.yearLineLengths[year] ?
              (yearsToPairCounts[year] / this.yearLineLengths[year]) : 0;
            return {name: year, value: value};
          })}];
          this.loading = false;
          this.cdr.markForCheck();
        };

        if (this.yearLineLengths) {
          this.afterBothFetched();
          this.afterBothFetched = undefined;
        }
      }, (err) => {
        this.logger.error('Line transect chart data handling failed!', err);
      });
  }

  updateBirdAssociationArea(value) {
    this.birdAssociationAreas = Array.isArray(value) ? value : [];
    this.update();
  }

  onTaxonSelect(result) {
    if (this.taxonId !== result.key) {
      this.taxonId = result.key;
      this.update();
    }
  }

  toggleFromYear() {
    this.fromYear = this.fromYear === 2006 ? undefined : 2006;
    this.update();
  }

  private fromYearToYearMonth(year) {
    const years = ['' + year];
    const now = new Date();
    const currentYear = now.getFullYear();
    let curIter = 0;
    while (year < currentYear && curIter < 150) {
      year++;
      curIter++;
      years.push('' + year);
    }
    return years;
  }
}
