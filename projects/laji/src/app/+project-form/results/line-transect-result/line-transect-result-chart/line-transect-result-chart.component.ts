import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of as ObservableOf, Subscription } from 'rxjs';
import { Logger } from '../../../../shared/logger';
import { combineLatest, map, tap } from 'rxjs/operators';
import { PagedResult } from '../../../../shared/model/PagedResult';
import { WarehouseApi } from '../../../../shared/api/WarehouseApi';
import { Area } from '../../../../shared/model/Area';
import { Chart, ChartDataset, ChartOptions, ChartType, Tooltip } from 'chart.js';
import { LineWithLine } from 'projects/laji/src/app/shared-modules/chart/line-with-line';

const tooltipPositionCursor = 'cursor' as any; // chart.js typings broken for custom tooltip position so we define it as 'any'.

@Component({
  selector: 'laji-line-transect-result-chart',
  templateUrl: './line-transect-result-chart.component.html',
  styleUrls: ['./line-transect-result-chart.component.css']
})
export class LineTransectResultChartComponent implements OnInit, OnDestroy {

  @Input() informalTaxonGroup?: string;
  @Input() defaultTaxonId!: string;
  @Input() collectionId!: string;
  @Input() showDefaultPeriodFilter = true;

  loading = false;
  areaTypes = Area.AreaType;
  birdAssociationAreas: string[] = [];
  currentArea?: string;
  taxon?: string;
  taxonId!: string;
  fromYear?: number;
  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  private yearLineLengths: any;
  minYear?: number;
  maxYear?: number;
  line: {name: string; series: {name: string; value: number}[]}[] = [];
  private afterBothFetched: any;
  private subQuery!: Subscription;
  private fetchSub!: Subscription;
  @ViewChild('myCanvas') canvas!: ElementRef;
  context?: CanvasRenderingContext2D;
  public gradient: any;
  public lineChartData: ChartDataset[] = [{data: [], label: 'Parim./km'}];
  public lineChartLabels: string[] = [];
  public lineChartOptions: ChartOptions = {
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
      intersect: false,
    },
    // Eslint disabled because it needs to be a function to have the correct 'this' reference.
    // eslint-disable-next-line object-shorthand
    onHover: function(a, e, element: any) {
      let indexChart;
      if (element[0]) {
       indexChart = Number(element[0]['_index']);
      } else {
        indexChart = -1;
      }

      const dataset = (this as any).data.datasets[0].data;
      if (element[0]) {
        (this as any).options.plugins.tooltip.callbacks.label = function(tooltipItem: any) {
          const range = (start: number, end: number, step: number) => Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
          const activePoint = element[0]['_chart'].tooltip._active[0];
          const tooltipPosition = element[0].tooltipPosition();
          const x = Number((tooltipPosition.x).toFixed(0));
          const y = Number((tooltipPosition.y).toFixed(0));
          const offset = element[0]['_chart'].config.data.labels[0] === '2006' ? 6 : 0;
          let empty = 0;
          if (indexChart !== -1 && indexChart + 1 > -1 && indexChart - 1 > -2) {
            if ( !dataset[Number(indexChart) + 1] || (indexChart === 0 && !dataset[Number(indexChart) + 1])) {
              const index = dataset.slice(indexChart + 1).findIndex((el: any) => el) + indexChart;
              const diff = index - Number(indexChart);
              if (activePoint['_chart'].tooltip._eventPosition.x >= x) {
                empty = -3 * diff;
              }
            }
            if ( !dataset[Number(indexChart) - 1] || (indexChart === (dataset.length - 1) && !dataset[Number(indexChart) - 1])) {
              if (activePoint['_chart'].tooltip._eventPosition.x <= x) {
                const index = dataset.slice(0, indexChart).reverse().findIndex((el: any) => el);
                const diff = Number(indexChart) - (Number(indexChart) - index);
                  empty = 3 * diff;
              }
            }
          }


          const colWidth = Math.ceil((element[0]['_chart'].chartArea['right'] - element[0]['_chart'].chartArea['left'])
          / element[0]['_chart'].config.data.labels.length);

        if ( range(x - Math.ceil(colWidth / 2), x + (Math.ceil(colWidth / 2) + (offset)), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.x + empty) !== -1 &&
        range(y - (Math.ceil(colWidth / 2) - offset), y + (Math.ceil(colWidth / 2) - offset), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.y) !== -1) {
          return tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
        } else {
          return 'Parim./Km:' + ' ' + tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
          }
        };
        (this as any).options.plugins.tooltip.callbacks.title = function(tooltipItem: any) {
          const year = element[0]['_chart'].config.data.labels[0] === '2006' ? 15 : 6;
          const offset = element[0]['_chart'].config.data.labels[0] === '2006' ? 6 : 0;
          const range = (start: number, end: number, step: number) => Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
          const activePoint = element[0]['_chart'].tooltip._active[0];
          const tooltipPosition = element[0].tooltipPosition();
          const x = Number((tooltipPosition.x).toFixed(0));
          const y = Number((tooltipPosition.y).toFixed(0));

          let empty = 0;
          if (indexChart !== -1 && indexChart + 1 > -1 && indexChart - 1 > -2) {
            if ( !dataset[Number(indexChart) + 1]) {
              const index = dataset.slice(indexChart + 1).findIndex((el: any) => el) + indexChart;
              const diff = index - Number(indexChart);
              if (activePoint['_chart'].tooltip._eventPosition.x >= x) {
                  empty = -3 * diff;
              }
            }
            if (!dataset[Number(indexChart) - 1]) {
              if (activePoint['_chart'].tooltip._eventPosition.x <= x) {
                const index = dataset.slice(0, indexChart).reverse().findIndex((el: any) => el);
                const diff = Number(indexChart) - (Number(indexChart) - index);
                  empty = 3 * diff;
              }
            }
          }


          const colWidth = Math.ceil((element[0]['_chart'].chartArea['right'] - element[0]['_chart'].chartArea['left'])
          / element[0]['_chart'].config.data.labels.length);

        if ( range(x - (Math.ceil(colWidth / 2)), x + (Math.ceil(colWidth / 2) + (offset)), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.x + empty) !== -1
        && range(y - (year + offset), y + (year - offset), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.y) !== -1) {
          return '' + tooltipItem[0].xLabel + ' · ' + 'Parim./Km';
        } else {
          return '';
        }
        };
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Parim./km'
        }
      },
      x: {
        title: {
          display: true,
          text:  'Vuodet'
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private warehouseApi: WarehouseApi,
    private logger: Logger,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    Chart.register(LineWithLine);
    (Tooltip.positioners as any).cursor = function(chartElements: any, coordinates: any) {
      return coordinates;
    };

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
    this.subQuery?.unsubscribe();
    this.fetchSub?.unsubscribe();
  }

  private navigate(taxonId: string, birdAssociationAreas: string[], fromYear: number | undefined) {
    this.router.navigate([], {queryParams: {
      taxonId,
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

    this.fetchSub?.unsubscribe();
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
            const yearLineLengths: any = {};
            data.results.forEach((result: any) => {
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
        const yearsToPairCounts: any = {};
        this.lineChartData[0].data = [];
        this.lineChartLabels = [];
        data.results.forEach((result: any) => {
          const {'gathering.conversions.year': year} = result.aggregateBy;
          if (!year) {
            return;
          }
          yearsToPairCounts[year] = result.pairCountSum;
        });
        this.afterBothFetched = () => {
          const resultsYears = Object.keys(yearsToPairCounts);
          const years = this.fromYearToYearMonth(resultsYears[0]);
          years.forEach(year => {
            const value = yearsToPairCounts[year] && this.yearLineLengths[year] ?
            (yearsToPairCounts[year] / this.yearLineLengths[year]) : NaN;
            this.lineChartData[0].data.push(value);
            this.lineChartLabels.push(year);
          });
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

  updateBirdAssociationArea(value: any) {
    this.birdAssociationAreas = Array.isArray(value) ? value : [];
    this.update();
  }

  onTaxonSelect(result: any) {
    if (this.taxonId !== result.key) {
      this.taxonId = result.key;
      this.update();
    }
  }

  toggleFromYear() {
    this.fromYear = this.fromYear === 2006 ? undefined : 2006;
    this.update();
  }

  between(value: number, first: number, last: number) {
    const lower = Math.min(first, last) , upper = Math.max(first, last);
    return value >= lower &&  value <= upper ;
  }

  private fromYearToYearMonth(year: any) {
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
