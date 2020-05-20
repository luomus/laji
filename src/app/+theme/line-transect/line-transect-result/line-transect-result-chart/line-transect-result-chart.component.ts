import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
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

  public lineChartData: ChartDataSets[] = [{data: [], label: 'Parim./km', backgroundColor: 'rgba(255,255,255,0)'}];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    elements: {
      line: {
          tension: 0,
          borderWidth: 2,
          backgroundColor: 'rgb(70,130,180)',
          borderColor: 'rgb(70,130,180)'
      },
      point: {
        radius: 0,
        hitRadius: 3
      }
    },
    tooltips: {
      mode: 'index',
      intersect: false,
      callbacks: {
        title: function(tooltipItem, data) {
          return '';
        },
        label: function(tooltipItem, data) {
            return 'Parim./Km:' + ' ' + tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
        }
      }
    },
    hover: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      datalabels: {
        display: false
      },
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
    Chart.controllers.LineWithLine = Chart.controllers.line.extend({
      draw: function(ease) {
        Chart.controllers.line.prototype.draw.call(this, ease);

        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
          const activePoint = this.chart.tooltip._active[0];
              const ctx = this.chart.ctx;
              const x = activePoint.tooltipPosition().x;
              const topY = this.chart.legend.bottom;
              const bottomY = this.chart.chartArea.bottom;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 0.5;
          ctx.strokeStyle = '#000';
          ctx.stroke();
          ctx.restore();
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
            (yearsToPairCounts[year] / this.yearLineLengths[year]) : 0;
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
