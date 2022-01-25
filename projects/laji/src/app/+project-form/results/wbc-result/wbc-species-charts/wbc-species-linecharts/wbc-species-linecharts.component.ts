import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { SEASON, WbcResultService } from '../../wbc-result.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartOptions, ChartType } from 'chart.js';
import { Color, PluginServiceGlobalRegistrationAndOptions } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'laji-wbc-species-linecharts',
  templateUrl: './wbc-species-linecharts.component.html',
  styleUrls: ['./wbc-species-linecharts.component.css']
})
export class WbcSpeciesLinechartsComponent implements OnInit, OnChanges {
  @Input() taxonId: string;
  @Input() taxonCensus = undefined;
  @Input() birdAssociationArea: string;


  counts: any;

  xScaleMin: number;
  xScaleMax: number;
  yScaleMin = 0;
  yScaleMax = 0;
  colorScheme = {
    domain: ['steelblue']
  };

  public lineChartData: {[s: string]: any[]} = {};
  public lineChartLabels: {[s: string]: any[]} = {};
  public lineChartOptions: ChartOptions = {};
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
  public lineChartPlugins = [
    pluginDataLabels as PluginServiceGlobalRegistrationAndOptions
  ];
  season: string;
  textCount: string;
  textSeasonCount: string;

  resultSub: Subscription;
  chartType: ChartType = 'LineWithLine';

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
      return coordinates;
    };

    Chart.defaults.LineWithLine = Chart.defaults.line;
    Chart.defaults.line.spanGaps = false;
    Chart.controllers.LineWithLine = Chart.controllers.line.extend({
      draw(ease) {
        Chart.controllers.line.prototype.draw.call(this, ease);
        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
          const year = 6;
          const offset = 0;
          const colWidht = Math.ceil((this['chart'].chartArea['right'] - this['chart'].chartArea['left']) / this['chart'].config.data.labels.length);
          const activePoint = this.chart.tooltip._active[0];
          const ctx = this.chart.ctx;
          const x = Number((activePoint.tooltipPosition().x).toFixed(0));
          const y = Number((activePoint.tooltipPosition().y).toFixed(0));
          const topY = this.chart.legend.bottom;
          const bottomY = this.chart.chartArea.bottom;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(70,130,180,1)');
          gradient.addColorStop(0.8, 'rgba(70,130,180,0.1)');
          const range = (start, end, step) => Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);

          if (range(x - (colWidht / 2), x + ((colWidht / 2) + offset), 1).indexOf(this.chart.tooltip._eventPosition.x === -1)  &&
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
    tooltips: {
      mode: 'index',
      position: 'cursor',
      intersect: false,
      titleAlign: 'center',
      bodyAlign: 'center',
      displayColors: false
    },
    hover: {
      mode: 'index',
      intersect: false,
      onHover(this, e, element) {
        let indexChart;
        if (element[0]) {
         indexChart = Number(element[0]['_index']);
        } else {
          indexChart = -1;
        }


        const dataset = this['tooltip']._data.datasets[0].data;
        if (element[0]) {
          element[0]['_chart'].tooltip._options.callbacks.label = function(tooltipItem, data) {
            const range = (start, end, step) => Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
            const activePoint = element[0]['_chart'].tooltip._active[0];
            const x = Number((activePoint.tooltipPosition().x).toFixed(0));
            const y = Number((activePoint.tooltipPosition().y).toFixed(0));
            const offset = data['datasets'][0]['count'].length < 15 ? 6 : 1;
            let empty = 0;
            const coeff = Math.ceil(570 / element[0]['_chart'].config.data.labels.length);
            if (indexChart !== -1 && indexChart + 1 > -1 && indexChart - 1 > -2) {
              if ( !dataset[Number(indexChart) + 1] || (indexChart === 0 && !dataset[Number(indexChart) + 1])) {
                const index = dataset.slice(indexChart + 1).findIndex(el => el) + indexChart;
                const diff = index - Number(indexChart);
                if (activePoint['_chart'].tooltip._eventPosition.x >= x) {
                  empty = -coeff * diff;
                }
              }
              if ( !dataset[Number(indexChart) - 1] || (indexChart === (dataset.length - 1) && !dataset[Number(indexChart) - 1])) {
                if (activePoint['_chart'].tooltip._eventPosition.x <= x) {
                  const index = dataset.slice(0, indexChart).reverse().findIndex(el => el);
                  const diff = Number(indexChart) - (Number(indexChart) - index);
                    empty = coeff * diff;
                }
              }
            }


            const colWidht = Math.ceil((element[0]['_chart'].chartArea['right'] - element[0]['_chart'].chartArea['left'])
            / element[0]['_chart'].config.data.labels.length);

          if ( range(x - Math.ceil(colWidht / 2), x + (Math.ceil(colWidht / 2) + (offset)), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.x + empty) !== -1 &&
          range(y - (Math.ceil(colWidht / 2) - offset), y + (Math.ceil(colWidht / 2) - offset), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.y) !== -1) {
            return tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
          } else {
            return data['datasets'][0]['translations'][0]
              + ': ' + tooltipItem.yLabel.toString().substr(0, tooltipItem.yLabel.toString().indexOf('.') + 4).replace('.', ',');
            }
          };
          element[0]['_chart'].tooltip._options.callbacks.title = function(tooltipItem, data) {
            const offset = data['datasets'][0]['count'].length < 15 ? 6 : 1;
            const range = (start, end, step) => Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);
            const activePoint = element[0]['_chart'].tooltip._active[0];
            const x = Number((activePoint.tooltipPosition().x).toFixed(0));
            const y = Number((activePoint.tooltipPosition().y).toFixed(0));

            let empty = 0;
            const coeff = Math.ceil(570 / element[0]['_chart'].config.data.labels.length);
            if (indexChart !== -1 && indexChart + 1 > -1 && indexChart - 1 > -2) {
              if ( !dataset[Number(indexChart) + 1]) {
                const index = dataset.slice(indexChart + 1).findIndex(el => el) + indexChart;
                const diff = index - Number(indexChart);
                if (activePoint['_chart'].tooltip._eventPosition.x >= x) {
                    empty = -coeff * diff;
                }
              }
              if (!dataset[Number(indexChart) - 1]) {
                if (activePoint['_chart'].tooltip._eventPosition.x <= x) {
                  const index = dataset.slice(0, indexChart).reverse().findIndex(el => el);
                  const diff = Number(indexChart) - (Number(indexChart) - index);
                    empty = coeff * diff;
                }
              }
            }


            const colWidht = Math.ceil((element[0]['_chart'].chartArea['right'] - element[0]['_chart'].chartArea['left'])
            / element[0]['_chart'].config.data.labels.length);
            const title1 =  data['datasets'][0]['translations'][0] + ' · ' + tooltipItem[0].xLabel;
            const title2 = data['datasets'][0]['translations'][1] + ': ' + data['datasets'][0]['count'][tooltipItem[0].index];
            const title3 = data['datasets'][0]['translations'][2] + ': ' + data['datasets'][0]['censusCount'][tooltipItem[0].index];

          if ( range(x - (Math.ceil(colWidht / 2)), x + (Math.ceil(colWidht / 2) + (offset)), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.x + empty) !== -1
          && range(y - (Math.ceil(colWidht / 2) - offset), y + (Math.ceil(colWidht / 2) - offset), 1).indexOf(activePoint['_chart'].tooltip._eventPosition.y) !== -1) {
            return [title1, title2, title3];
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
          labelString: this.translate.instant('wbc.stats.abundanceGraphs.yAxis')
        },
        ticks: {
            beginAtZero: true,
            callback(value) { if (value as any % 1 === 0) { return value; } },
            stepSize: 2
        }
      }],
      xAxes: [{
        scaleLabel: {
          display : true,
          labelString: this.translate.instant('wbc.stats.abundanceGraphs.xAxis')
        }
      }]
    },
    plugins: {
      datalabels: {
        display: false
      }
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
          spacing: 0,
          borderWidth: 0,
          borderColor: 'rgba(160,160,160,0.5)'
         }
        ]
    };
    this.lineChartData[season][0]['data'][0]['data'] = [];
    this.lineChartData[season][0]['data'][0]['count'] = [];
    this.lineChartData[season][0]['data'][0]['censusCount'] = [];
    this.lineChartData[season][0]['label'] = 'Yksilöm./laskentoja';
    this.lineChartLabels[season] = [];

    const yearsTotal = Object.keys(data).map(y => parseInt(y, 10));
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    const years = range(Math.min(...yearsTotal), Math.max(...yearsTotal), 1);
    years.sort();

    let prevYear;
    let series = [];
    const series1 = [];
    const series2 = [];
    const count = [];
    const censusCount = [];
    for (const year of years) {
      const parsedYear = parseInt(year, 10);
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
