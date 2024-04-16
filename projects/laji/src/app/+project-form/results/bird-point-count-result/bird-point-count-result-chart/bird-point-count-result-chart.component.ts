import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Chart, ChartDataset, ChartOptions, ChartType, Tooltip } from 'chart.js';
import { PagedResult } from 'projects/laji-api-client/src/public-api';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { LineWithLine } from 'projects/laji/src/app/shared-modules/chart/line-with-line';
import { TranslateService } from '@ngx-translate/core';

interface PairCountResults {
  aggregateBy: {
    'gathering.conversions.year': string;
  };
  count: number;
  individualCountSum: number;
  individualCountMax: number;
  oldestRecord: string;
  newestRecord: string;
  pairCountSum: number;
  pairCountMax: number;
  firstLoadDateMin: string;
  firstLoadDateMax: string;
  recordQualityMax: string;
  securedCount: number;
}

interface PairCountObject {
  year: string;
  pairCount: number;
}

interface DocumentCountResults {
  aggregateBy: {
    'document.documentId': string;
    'gathering.conversions.year': string;
  };
  count: number;
}

interface DocumentCountObject {
  year: string;
  documentCount: number;
}

const tooltipPositionCursor = 'cursor' as any; // chart.js typings broken for custom tooltip position so we define it as 'any'.

@Component({
  selector: 'laji-bird-point-count-result-chart',
  templateUrl: './bird-point-count-result-chart.component.html',
  styleUrls: ['./bird-point-count-result-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdPointCountResultChartComponent implements OnInit {
  readonly collections$ = new BehaviorSubject<string[]>([]);
  @Input() set collections(v: string[]) { this.collections$.next(v); };

  lineChartData: ChartDataset[] = [{ data: [], label: this.translate.instant('birdPointCount.stats.chart.y.title') }];
  lineChartLabels: string[] = [];
  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    elements: {
      line: {
        tension: 0,
        borderWidth: 1.5,
        backgroundColor: 'rgb(70,130,180)',
        borderColor: 'rgb(70,130,180)',
      },
      point: {
        radius: 3,
        hitRadius: 6,
        backgroundColor: 'rgb(70,130,180)'
      }
    },
    hover: {
      mode: 'index',
      intersect: false
    },
    scales: {
      y: {
        title: {
          display: true,
          text: this.translate.instant('birdPointCount.stats.chart.y.title')
        }
      },
      x: {
        title: {
          display: true,
          text: this.translate.instant('birdPointCount.stats.chart.x.title')
        }
      }
    },
    plugins: {
      tooltip: {
        mode: 'index',
        position: tooltipPositionCursor,
        intersect: false
      },
    }
  };
  chartType: ChartType = 'LineWithLine';
  loading = true;

  constructor(
    private warehouseApi: WarehouseApi,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    Chart.register(LineWithLine);
    (Tooltip.positioners as any).cursor = function(chartElements, coordinates) {
      return coordinates;
    };
    this.getChartData$().subscribe();
  }

  private getPairCounts$() {
    return this.collections$.pipe(
      switchMap((collections) => this.warehouseApi.warehouseQueryUnitStatisticsGet(
        {
          collectionId: collections, pairCounts: true, includeSubCollections: false, cache: true
        },
        [
          'gathering.conversions.year'
        ],
        [
          'gathering.conversions.year'
        ],
        10000
      ))
    ).pipe(
      map((res: PagedResult<PairCountResults>) =>
        res.results.map(item => <PairCountObject>({ year: item.aggregateBy['gathering.conversions.year'], pairCount: item.pairCountSum }))
      )
    );
  }

  private getDocumentCounts$() {
    return this.collections$.pipe(
      switchMap((collections) => this.warehouseApi.warehouseQueryGatheringStatisticsGet(
        {
          collectionId: collections, onlyCount: true, includeSubCollections: false, cache: true
        },
        [
          'document.documentId',
          'gathering.conversions.year'
        ],
        [
          'gathering.conversions.year'
        ],
        10000
      ))
    ).pipe(
      map((res: PagedResult<DocumentCountResults>) => {
        const documentCountArray: DocumentCountObject[] = [];
        res.results.forEach(documentResult => {
          const year = documentResult.aggregateBy['gathering.conversions.year'];
          const index = documentCountArray.findIndex(item => item.year === year);
          if (index !== -1) {
            documentCountArray[index].documentCount++;
          } else {
            documentCountArray.push({ year, documentCount: 1 });
          }
        });
        return documentCountArray;
      })
    );
  }

  private getChartData$() {
    return combineLatest([this.getPairCounts$(), this.getDocumentCounts$()]).pipe(
      tap(() => { this.loading = true; }),
      map(([pairCountArray, documentCountArray]) => {
        const currentYear = new Date().getFullYear();
        const firstYear = pairCountArray[0].year;
        const years = Array.from({ length: currentYear - +firstYear + 1 }, (_, index) => (+firstYear + index).toString());

        const chartData = years.map(year => {
          const pairCountItem = pairCountArray.find(item => item.year === year);
          const documentCountItem = documentCountArray.find(item => item.year === year);
          if (!pairCountItem || !documentCountItem) {
            return NaN;
          } else {
            return pairCountItem.pairCount / documentCountItem.documentCount;
          }
        });

        this.lineChartData[0].data = chartData;
        this.lineChartLabels = years;
      }
      ),
      tap(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }),
    );
  }
}
