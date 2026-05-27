import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Chart, ChartDataset, ChartOptions, ChartType, Tooltip } from 'chart.js';
import { BehaviorSubject, Observable, Subscription, combineLatest, filter } from 'rxjs';
import { map, switchMap, tap } from 'rxjs';
import { LineWithLine } from 'projects/laji/src/app/shared-modules/chart/line-with-line';
import { TranslateService } from '@ngx-translate/core';
import { toHtmlSelectElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { components } from 'projects/laji-api-client/generated/api';

type AggregateResponse = components['schemas']['WarehouseDwQuery_AggregateResponse'];

interface PairCountObject {
  year: string;
  pairCount: number;
}

interface DocumentCountObject {
  year: string;
  documentCount: number;
}

@Component({
    selector: 'laji-bird-point-count-result-chart',
    templateUrl: './bird-point-count-result-chart.component.html',
    styleUrls: ['./bird-point-count-result-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BirdPointCountResultChartComponent implements OnInit, OnDestroy {
  readonly collections$ = new BehaviorSubject<string[]>([]);
  readonly taxon$ = new BehaviorSubject<string | undefined>(undefined);
  @Input() set collections(v: string[]) { this.collections$.next(v); };
  @Input() set taxon(v: string | undefined) { this.taxon$.next(v); };
  @Input() taxonOptions!: { label: string; value: string }[] | null;

  @Output() taxonChange = new EventEmitter<string>();

  toHtmlSelectElement = toHtmlSelectElement;

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
        position: 'nearest',
        intersect: false
      },
    }
  };
  chartType: ChartType = 'LineWithLine';

  defaultTaxon?: string;
  loading = true;

  private chartSub!: Subscription;

  constructor(
    private api: LajiApiClientService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.defaultTaxon = this.taxon$.getValue() !== undefined ? this.taxon$.getValue() : '';

    Chart.register(LineWithLine);
    Tooltip.positioners.nearest = (chartElements, coordinates) => coordinates;

    this.chartSub = this.setChartData$().subscribe();
  }

  ngOnDestroy(): void {
    this.chartSub.unsubscribe();
  }

  private getPairCounts$(): Observable<PairCountObject[]> {
    return combineLatest([this.collections$, this.taxon$]).pipe(
      switchMap(([collections, taxon]) => this.api.get('/warehouse/query/unit/statistics',
        {
          query: {
            aggregateBy: ['gathering.conversions.year'],
            orderBy: ['gathering.conversions.year'],
            collectionId: collections.join(','),
            taxonId: taxon,
            pairCounts: true,
            includeSubCollections: false,
            cache: true,
            pageSize: 10000
          }
        },
      )),
      map(res => res.results.map(item => ({ year: item.aggregateBy['gathering.conversions.year'], pairCount: item.pairCountSum })))
    );
  }

  private getDocumentCounts$(): Observable<DocumentCountObject[]> {
    return this.collections$.pipe(
      switchMap((collections) => this.api.get('/warehouse/query/gathering/statistics',
        {
          query: {
            aggregateBy: ['gathering.conversions.year', 'document.documentId'],
            orderBy: ['gathering.conversions.year'],
            collectionId: collections.join(','),
            onlyCount: true,
            includeSubCollections: false,
            cache: true,
            pageSize: 10000
          }
        }
      )),
      map((res) => {
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

  private setChartData$(): Observable<void> {
    return combineLatest([this.getPairCounts$(), this.getDocumentCounts$()]).pipe(
      tap(() => { this.loading = true; }),
      map(([pairCountArray, documentCountArray]) => {
        const currentYear = new Date().getFullYear();
        const firstYear = documentCountArray[0].year;
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

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }
}
