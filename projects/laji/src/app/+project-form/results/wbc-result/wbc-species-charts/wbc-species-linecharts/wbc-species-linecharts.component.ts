import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { SEASON, WbcResultService } from '../../wbc-result.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartOptions, ChartType, Tooltip } from 'chart.js';
import { LineWithLine } from '../../../../../shared-modules/chart/line-with-line';
//
// Chart.register(LineWithLine);

@Component({
  selector: 'laji-wbc-species-linecharts',
  templateUrl: './wbc-species-linecharts.component.html',
  styleUrls: ['./wbc-species-linecharts.component.css']
})
export class WbcSpeciesLinechartsComponent implements OnInit, OnChanges {
  @Input() taxonId: string | undefined;
  @Input() taxonCensus: string | undefined = undefined;
  @Input() birdAssociationArea: string | undefined;

  counts: any;

  xScaleMin?: number;
  xScaleMax?: number;
  yScaleMin = 0;
  yScaleMax = 0;

  public lineChartData: {[s: string]: any[]} = {};
  public lineChartLabels: {[s: string]: any[]} = {};
  public lineChartOptions: ChartOptions = {};
  season?: string;
  textCount?: string;
  textSeasonCount?: string;

  resultSub!: Subscription;
  chartType: ChartType = 'LineWithLine';

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    Chart.register(LineWithLine);
    (Tooltip.positioners as any).cursor = function(chartElements: any, coordinates: any) {
      return coordinates;
    };

    const tooltipPositionCursor = 'cursor' as any; // chart.js typings broken for custom tooltip position so we define it as 'any'.
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
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
      hover: {
        mode: 'index',
        intersect: false,
      },
      // Eslint disabled because it needs to be a function to have the correct 'this' reference.
      // eslint-disable-next-line object-shorthand
      onHover: function(a, b, element: any) {
        let indexChart: number;
        if (element[0]) {
          indexChart = Number(element[0]['_index']);
        } else {
          indexChart = -1;
        }

        const dataset = (this as any).data.datasets[0].data;
        if (element[0]) {
          (this as any).options.plugins.tooltip.callbacks.label = function(tooltipItem: any, data: any) {
            const range = (start: number, end: number, step: number) => Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
            const activePoint = element[0]['_chart'].tooltip._active[0];
            const tooltipPosition = element[0].tooltipPosition();
            const x = Number((tooltipPosition.x).toFixed(0));
            const y = Number((tooltipPosition.y).toFixed(0));
            const offset = data['datasets'][0]['count'].length < 15 ? 6 : 1;
            let empty = 0;
            const coeff = Math.ceil(570 / element[0]['_chart'].config.data.labels.length);
            if (indexChart !== -1 && indexChart + 1 > -1 && indexChart - 1 > -2) {
              if ( !dataset[Number(indexChart) + 1] || (indexChart === 0 && !dataset[Number(indexChart) + 1])) {
                const index = dataset.slice(indexChart + 1).findIndex((el: any) => el) + indexChart;
                const diff = index - Number(indexChart);
                if (activePoint['_chart'].tooltip._eventPosition.x >= x) {
                  empty = -coeff * diff;
                }
              }
              if ( !dataset[Number(indexChart) - 1] || (indexChart === (dataset.length - 1) && !dataset[Number(indexChart) - 1])) {
                if (activePoint['_chart'].tooltip._eventPosition.x <= x) {
                  const index = dataset.slice(0, indexChart).reverse().findIndex((el: any) => el);
                  const diff = Number(indexChart) - (Number(indexChart) - index);
                  empty = coeff * diff;
                }
              }
            }

            const colWidth = Math.ceil((element[0]['_chart'].chartArea['right'] - element[0]['_chart'].chartArea['left'])
              / element[0]['_chart'].config.data.labels.length);

            if ( range(x - Math.ceil(colWidth / 2), x + (Math.ceil(colWidth / 2) + (offset)), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.x + empty) !== -1 &&
              range(y - (Math.ceil(colWidth / 2) - offset), y + (Math.ceil(colWidth / 2) - offset), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.y) !== -1) {
              return tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
            } else {
              return data['datasets'][0]['translations'][0]
                + ': ' + tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
            }
          };
          element[0]['_chart'].tooltip._options.callbacks.title = function(tooltipItem: any, data: any) {
            const offset = data['datasets'][0]['count'].length < 15 ? 6 : 1;
            const range = (start: number, end: number, step: number) => Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
            const activePoint = element[0]['_chart'].tooltip._active[0];
            const tooltipPosition = element[0].tooltipPosition();
            const x = Number((tooltipPosition.x).toFixed(0));
            const y = Number((tooltipPosition.y).toFixed(0));

            let empty = 0;
            const coeff = Math.ceil(570 / element[0]['_chart'].config.data.labels.length);
            if (indexChart !== -1 && indexChart + 1 > -1 && indexChart - 1 > -2) {
              if ( !dataset[Number(indexChart) + 1]) {
                const index = dataset.slice(indexChart + 1).findIndex((el: any) => el) + indexChart;
                const diff = index - Number(indexChart);
                if (activePoint['_chart'].tooltip._eventPosition.x >= x) {
                  empty = -coeff * diff;
                }
              }
              if (!dataset[Number(indexChart) - 1]) {
                if (activePoint['_chart'].tooltip._eventPosition.x <= x) {
                  const index = dataset.slice(0, indexChart).reverse().findIndex((el: any) => el);
                  const diff = Number(indexChart) - (Number(indexChart) - index);
                  empty = coeff * diff;
                }
              }
            }


            const colWidth = Math.ceil((element[0]['_chart'].chartArea['right'] - element[0]['_chart'].chartArea['left'])
              / element[0]['_chart'].config.data.labels.length);
            const title1 =  data['datasets'][0]['translations'][0] + ' · ' + tooltipItem[0].xLabel;
            const title2 = data['datasets'][0]['translations'][1] + ': ' + data['datasets'][0]['count'][tooltipItem[0].index];
            const title3 = data['datasets'][0]['translations'][2] + ': ' + data['datasets'][0]['censusCount'][tooltipItem[0].index];

            if (
              range(x - (Math.ceil(colWidth / 2)),
                x + (Math.ceil(colWidth / 2) + (offset)),
                1
              ).indexOf(activePoint['_chart'].tooltip._eventPosition.x + empty) !== -1
              && range(
                y - (Math.ceil(colWidth / 2) - offset),
                y + (Math.ceil(colWidth / 2) - offset),
                1
              ).indexOf(activePoint['_chart'].tooltip._eventPosition.y) !== -1
            ) {
              return [title1, title2, title3];
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
            text: this.translate.instant('wbc.stats.abundanceGraphs.yAxis')
          },
          beginAtZero: true,
          ticks: {
            callback(value) {
              if (value as any % 1 === 0) {
                return value;
              }
              return undefined;
            },
            stepSize: 2
          }
        },
        x: {
          title: {
            display: true,
            text: this.translate.instant('wbc.stats.abundanceGraphs.xAxis')
          }
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          position: tooltipPositionCursor,
          intersect: false,
          titleAlign: 'center',
          bodyAlign: 'center',
          displayColors: false
        },
      }
    };
  }

  ngOnChanges() {
    this.counts = undefined;
    if (this.taxonId) {
      if (this.resultSub) {
        this.resultSub.unsubscribe();
      }
      this.resultSub = this.resultService.getCountsByYearForSpecies(this.taxonId, this.birdAssociationArea, this.taxonCensus)
        .subscribe(data => {
          this.xScaleMin = undefined;
          this.xScaleMax = undefined;
          this.yScaleMax = 0;

          this.counts = data;
          this.setLines(data['fall'], 'fall');
          this.setLines(data['winter'], 'winter');
          this.setLines(data['spring'], 'spring');
          this.cd.markForCheck();
        });
    }
  }

  private setLines(data: any, season: SEASON) {
    this.lineChartData[season] = [];
    this.lineChartData[season][0] = {
        label: this.translate.instant('wbc.stats.abundanceGraphs.yAxis'),
        data: [
        {
          data: null,
          count: null,
          censusCount: null,
          translations: [season, this.translate.instant('wbc.stats.individualCountSum'),
          this.translate.instant('wbc.stats.censusCount')],
         }
        ]
    };
    this.lineChartData[season][0]['data'][0]['data'] = [];
    this.lineChartData[season][0]['data'][0]['count'] = [];
    this.lineChartData[season][0]['data'][0]['censusCount'] = [];
    this.lineChartData[season][0]['label'] = 'Yksilöm./laskentoja';
    this.lineChartLabels[season] = [];

    const yearsTotal = Object.keys(data).map(y => parseInt(y, 10));
    const range = (start: number, stop: number, step: number) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
    const years = range(Math.min(...yearsTotal), Math.max(...yearsTotal), 1);
    years.sort();

    let prevYear;
    let series = [];
    const series1 = [];
    const series2 = [];
    const count = [];
    const censusCount = [];
    for (const year of years) {
      const parsedYear = typeof year === 'number' ? year : parseInt(year, 10);
      const value = data[year] ? data[year].count / data[year].censusCount : NaN;
      count.push(data[year] ? data[year].count : NaN);
      censusCount.push(data[year] ? data[year].censusCount : NaN);
      if (prevYear && parsedYear > prevYear + 1) {
        series1.push(value);
        series2.push(parsedYear.toString());
        series = [];
      }
      series.push({name: parsedYear, value});
      series1.push(value);
      series2.push(parsedYear.toString());

      if (!this.xScaleMin || parsedYear < this.xScaleMin) {
        this.xScaleMin = parsedYear;
      }
      if (!this.xScaleMax || parsedYear > this.xScaleMax) {
        this.xScaleMax = parsedYear;
      }
      if (value > this.yScaleMax) {
        this.yScaleMax = value;
      }

      prevYear = parsedYear;
    }
    this.lineChartData[season][0]['data'][0]['data'] = series1;
    this.lineChartData[season][0]['data'][0]['count'] = count;
    this.lineChartData[season][0]['data'][0]['censusCount'] = censusCount;
    this.lineChartLabels[season].push(series2);

  }


  tickFormatting(val: number): string {
    if (val % 1 !== 0) {
      return '';
    }
    return '' + val;
  }
}
