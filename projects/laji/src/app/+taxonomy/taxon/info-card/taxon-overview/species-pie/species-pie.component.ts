import { ChangeDetectionStrategy, Component, EventEmitter,
Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, Chart } from 'chart.js';
import { BaseChartDirective} from 'ng2-charts';
import 'chartjs-chart-treemap/dist/chartjs-chart-treemap.js';
import { MultiLangService } from 'projects/laji/src/app/shared-modules/lang/service/multi-lang.service';
import * as chartJs from 'chart.js';


@Component({
  selector: 'laji-species-pie',
  templateUrl: './species-pie.component.html',
  styleUrls: ['./species-pie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesPieComponent implements OnInit, OnChanges {
  @Input() children: Taxonomy[];
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  data: any;
  total = 0;

  chartType = 'treemap' as chartJs.ChartType;
  lineChartData: any[] = [];
  lineChartOptions: ChartOptions = {};
  lineChartLabels = [];
  lineChartPlugins = [];
  lineChartColors: any[] = [];
  dataById: {[key: string]: Taxonomy} = {};
  colorPalette = ['#A8385D', '#7AA3E5', '#A27EA8', '#7ED3ED', '#50ABCC', '#AD6886', '#8796C0', '#ADCDED', '#ABD1F0', '#AAE3F5'];

  @Output() taxonSelect = new EventEmitter<string>();

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    const lajia = this.translate.instant('taxonomy.species');
    const laji = this.translate.instant('taxonomy.species.singular');
    this.lineChartOptions = {responsive: true,
      maintainAspectRatio : false,
      cutoutPercentage: 50,
      elements: {
        point: {
          radius: 5,
          hitRadius: 10
        }
      },
      legend: {
        display: false
      },
      tooltips: {
        mode: 'nearest',
        intersect: false,
        bodyAlign: 'center',
        displayColors: false,
        callbacks: {
          title: function(item, data) {
            return data.datasets[0]['tree'][item[0]['index']].label;
          },
          label: function(item, data) {
            const species = (data.datasets[0]['tree'][item['index']].value < 2) ? laji :
            lajia;
            return data.datasets[0]['tree'][item['index']].value + ' ' + species;
          }
        }
      },
      plugins: {
        datalabels: {
          display: false
        }
      },
      animation: {
        duration: 1,
        onComplete: function () {
            const chartInstance = this.chart,
            ctx = chartInstance.ctx;
            const chart_width = chartInstance['width'];
            const font_size = Math.round(chart_width / 80) > 10 ? Math.round(chart_width / 80) : 10;
            ctx.font = Chart.helpers.fontString(font_size, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000';
            ctx.textBaseline = 'bottom';
            if (this.data.datasets[0].tree && this.data.datasets[0].tree.length < 200) {
              this.data.datasets.forEach(function (dataset, i) {
                const meta = chartInstance.controller.getDatasetMeta(i);
                meta.data.forEach(function (bar, index) {
                    const label = dataset.tree[index].label;
                    const data = dataset.tree[index].value;
                    const width = Math.ceil(ctx.measureText(label).width);
                    const final_label = width < Math.ceil(dataset['data'][index].w) ? label : '';
                    const final_data = width < Math.ceil(dataset['data'][index].w) ? data : '';
                    ctx.fillText(final_label, bar['_model']['x'], bar['_model']['y'] - (bar['_model']['height'] / 2));
                    ctx.fillText(final_data, bar['_model']['x'], bar['_model']['y'] - (bar['_model']['height'] / 2) + 20);
                });
            });
            }
        }
      },
      events: ['mousemove', 'mouseout', 'click'],
      hover: {
        animationDuration: 0,
        onHover: (event, chartElement) => {
          event['target']['style']['cursor'] = chartElement[0] ? 'pointer' : 'default';
        }
      }
    };
  }

  ngOnChanges() {
    this.dataById = {};
    this.total = 0;
    this.lineChartColors = [{backgroundColor: []}];
    this.lineChartData = [{
      data: [
      {
        data: null,
        key: 'value',
        groups: [],
        spacing: 0,
        borderWidth: 0,
        borderColor: 'rgba(160,160,160,0.5)'
       }
      ]
    }
    ];
    this.lineChartLabels = [];
    const tmp_array = [];
    (this.children || []).forEach((child, index) => {
      const id = child.id;
      const count = child.countOfFinnishSpecies;
      this.total += count;


      if (count > 0) {
        this.dataById[id] = child;
        tmp_array.push({value: count,
        label: (child.vernacularName) ?
        ( typeof child.vernacularName  === 'object' ?
        MultiLangService.getValue(child.vernacularName, this.translate.currentLang) : child.vernacularName)  : child.scientificName, id: id});
        this.lineChartLabels.push(child.vernacularName || child.scientificName);
        this.lineChartColors[0]['backgroundColor'].push(this.colorPalette[index % this.colorPalette.length]);
      }
    });

    tmp_array.sort((a, b) => (a.value > b.value) ? -1 : 1);
    this.lineChartData[0]['data'][0]['data'] = tmp_array;

  }

}
