import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of as ObservableOf, Subscription } from 'rxjs';
import { ObservationResultService } from '../../../../shared-modules/observation-result/service/observation-result.service';
import { Logger } from '../../../../shared/logger';
import { combineLatest, map, tap } from 'rxjs/operators';
import { PagedResult } from '../../../../shared/model/PagedResult';
import { WarehouseApi } from '../../../../shared/api/WarehouseApi';
import { Area } from '../../../../shared/model/Area';
import { Chart, ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { tooltip } from 'leaflet';

@Component({
  selector: 'laji-line-transect-result-chart',
  templateUrl: './line-transect-result-chart.component.html',
  styleUrls: ['./line-transect-result-chart.component.css']
})
export class LineTransectResultChartComponent implements OnInit, OnDestroy {

  @Input() informalTaxonGroup: string;
  @Input() defaultTaxonId: string;
  @Input() collectionId: string;
  @Input() showDefaultPeriodFilter = true;

  loading = false;
  areaTypes = Area.AreaType;
  birdAssociationAreas: string[] = [];
  currentArea;
  taxon: string;
  taxonId: string;
  fromYear: number;
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
  @ViewChild('myCanvas') canvas: ElementRef;
  context: CanvasRenderingContext2D;
  public gradient: any;
  public lineChartData: ChartDataSets[] = [{data: [], label: 'Parim./km', backgroundColor: 'rgba(255,255,255,0)'}];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    elements: {
      line: {
          tension: 0,
          borderWidth: 1.5,
          backgroundColor: 'rgb(70,130,180)',
          borderColor: 'rgb(70,130,180)'
      },
      point: {
        radius: 3,
        hitRadius: 6
      }
    },
    tooltips: {
      mode: 'index',
      position: 'cursor',
      intersect: false
    },
    hover: {
      mode: 'index',
      intersect: false,
      onHover: function (this, e, element) {
        let index_chart;
        if (element[0]) {
         index_chart = Number(element[0]['_index']);
        } else {
          index_chart = -1;
        }


        const dataset = this['tooltip']._data.datasets[0].data;
        if (element[0]) {
          element[0]['_chart'].tooltip._options.callbacks.label = function (tooltipItem, data) {
            const range = (start, end, step) => {
              return Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
            };
            const activePoint = element[0]['_chart'].tooltip._active[0];
            const x = Number((activePoint.tooltipPosition().x).toFixed(0));
            const y = Number((activePoint.tooltipPosition().y).toFixed(0));
            const offset = element[0]['_chart'].config.data.labels[0] === '2006' ? 6 : 0;
            let empty = 0;
            if (index_chart !== -1 && index_chart + 1 > -1 && index_chart - 1 > -2) {
              if ( !dataset[Number(index_chart) + 1] || (index_chart === 0 && !dataset[Number(index_chart) + 1])) {
                const index = dataset.slice(index_chart + 1).findIndex(el => el) + index_chart;
                const diff = index - Number(index_chart);
                if (activePoint['_chart'].tooltip._eventPosition.x >= x) {
                  empty = -3 * diff;
                }
              }
              if ( !dataset[Number(index_chart) - 1] || (index_chart === (dataset.length - 1) && !dataset[Number(index_chart) - 1])) {
                if (activePoint['_chart'].tooltip._eventPosition.x <= x) {
                  const index = dataset.slice(0, index_chart).reverse().findIndex(el => el);
                  const diff = Number(index_chart) - (Number(index_chart) - index);
                    empty = 3 * diff;
                }
              }
            }


            const col_width = Math.ceil((element[0]['_chart'].chartArea['right'] - element[0]['_chart'].chartArea['left'])
            / element[0]['_chart'].config.data.labels.length);

          if ( range(x - Math.ceil(col_width / 2), x + (Math.ceil(col_width / 2) + (offset)), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.x + empty) !== -1 &&
          range(y - (Math.ceil(col_width / 2) - offset), y + (Math.ceil(col_width / 2) - offset), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.y) !== -1) {
            return tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
          } else {
            return 'Parim./Km:' + ' ' + tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
            }
          };
          element[0]['_chart'].tooltip._options.callbacks.title = function (tooltipItem, data) {
            const year = element[0]['_chart'].config.data.labels[0] === '2006' ? 15 : 6;
            const offset = element[0]['_chart'].config.data.labels[0] === '2006' ? 6 : 0;
            const range = (start, end, step) => {
              return Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
            };
            const activePoint = element[0]['_chart'].tooltip._active[0];
            const x = Number((activePoint.tooltipPosition().x).toFixed(0));
            const y = Number((activePoint.tooltipPosition().y).toFixed(0));
            const left_offset = 0, right_offset = 0;

            let empty = 0;
            if (index_chart !== -1 && index_chart + 1 > -1 && index_chart - 1 > -2) {
              if ( !dataset[Number(index_chart) + 1]) {
                const count = 0;
                const index = dataset.slice(index_chart + 1).findIndex(el => el) + index_chart;
                const diff = index - Number(index_chart);
                if (activePoint['_chart'].tooltip._eventPosition.x >= x) {
                    empty = -3 * diff;
                }
              }
              if (!dataset[Number(index_chart) - 1]) {
                if (activePoint['_chart'].tooltip._eventPosition.x <= x) {
                  const count = 0;
                  const index = dataset.slice(0, index_chart).reverse().findIndex(el => el);
                  const diff = Number(index_chart) - (Number(index_chart) - index);
                    empty = 3 * diff;
                }
              }
            }


            const col_width = Math.ceil((element[0]['_chart'].chartArea['right'] - element[0]['_chart'].chartArea['left'])
            / element[0]['_chart'].config.data.labels.length);

          if ( range(x - (Math.ceil(col_width / 2)), x + (Math.ceil(col_width / 2) + (offset)), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.x + empty) !== -1
          && range(y - (year + offset), y + (year - offset), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.y) !== -1) {
            return '' + tooltipItem[0].xLabel + ' · ' + 'Parim./Km';
          } else {
            return '';
          }
          };
        }
      }
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          display : true,
          labelString: 'Parim./km'
        }
      }],
      xAxes: [{
        scaleLabel: {
          display : true,
          labelString: 'Vuodet'
        }
      }]
    },
    plugins: {
      datalabels: {
        display: false
      }
    }
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgb(255,255,255,0)',
      borderColor: 'rgb(70,130,180)',
      pointBackgroundColor: 'rgb(70,130,180)',
      pointBorderColor: 'rgb(70,130,180)',
      pointHoverBackgroundColor: 'rgb(70,130,180)',
      pointHoverBorderColor: 'rgb(70,130,180)'
    }
  ];
  public lineChartPlugins = [pluginAnnotations, pluginDataLabels];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultService: ObservationResultService,
    private warehouseApi: WarehouseApi,
    private logger: Logger,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
      return coordinates;
    };

    Chart.defaults.LineWithLine = Chart.defaults.line;
    Chart.defaults.line.spanGaps = false;
    Chart.controllers.LineWithLine = Chart.controllers.line.extend({
      draw: function(ease) {
        Chart.controllers.line.prototype.draw.call(this, ease);
        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
          const year = this.chart.tooltip._data.labels[0] === '2006' ? 15 : 6;
          const offset = this.chart.tooltip._data.labels[0] === '2006' ? 6 : 0;
          const col_width = Math.ceil((this['chart'].chartArea['right'] - this['chart'].chartArea['left']) / this['chart'].config.data.labels.length);
          const activePoint = this.chart.tooltip._active[0];

          const ctx = this.chart.ctx;
          const x = Number((activePoint.tooltipPosition().x).toFixed(0));
          const y = Number((activePoint.tooltipPosition().y).toFixed(0));
          const topY = this.chart.legend.bottom;
          const bottomY = this.chart.chartArea.bottom;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(70,130,180,1)');
          gradient.addColorStop(0.8, 'rgba(70,130,180,0.1)');
          const range = (start, end, step) => {
            return Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
          };

          if (range(x - (col_width / 2), x + ((col_width / 2) + offset), 1).indexOf(this.chart.tooltip._eventPosition.x === -1)  &&
          range(y - (year + offset), y + (year - offset), 1).indexOf(this.chart.tooltip._eventPosition.y) === -1) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = '#000';
            ctx.stroke();
            ctx.restore();
          } else {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 9;
            ctx.strokeStyle = gradient;
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    });

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
        this.lineChartData[0].data = [];
        this.lineChartLabels = [];
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

  between(value, first, last) {
    const lower = Math.min(first, last) , upper = Math.max(first, last);
    return value >= lower &&  value <= upper ;
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
