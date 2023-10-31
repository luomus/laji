import { ChangeDetectionStrategy, Component, EventEmitter,
Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, Chart } from 'chart.js';
import { BaseChartDirective} from 'ng2-charts';
import 'chartjs-chart-treemap';
import { MultiLangService } from 'projects/laji/src/app/shared-modules/lang/service/multi-lang.service';
import { fontString } from 'chart.js/helpers';


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

  chartType: any = 'treemap';
  lineChartData: any[] = [];
  lineChartOptions: ChartOptions = {};
  lineChartLabels = [];
  // TODO check after compiles
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
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio : false,
      // TODO ??!!
      cutout: 50,
      elements: {
        point: {
          radius: 5,
          hitRadius: 10
        }
      },
      legend: {
        display: false
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        bodyAlign: 'center',
        displayColors: false,
        callbacks: {
          title(item, data) {
            return data.datasets[0]['tree'][item[0]['index']].label;
          },
          label(item, data) {
            const species = (data.datasets[0]['tree'][item['index']].value < 2) ? laji :
            lajia;
            return data.datasets[0]['tree'][item['index']].value + ' ' + species;
          }
        }
      },
      animation: {
        duration: 1,
        // Eslint disabled because it needs to be a function to have the correct 'this' reference.
        // eslint-disable-next-line object-shorthand
        onComplete: function() {
            const chartInstance: Chart = ((this as any).chart as Chart),
            ctx = chartInstance.ctx;
            const chartWidth = chartInstance['width'];
            const fontSize = Math.round(chartWidth / 80) > 10 ? Math.round(chartWidth / 80) : 10;
            ctx.font = fontString(fontSize, Chart.defaults.font.style, Chart.defaults.font.family);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000';
            ctx.textBaseline = 'bottom';
            if ((this.data.datasets[0] as any).tree?.length < 200) {
              this.data.datasets.forEach(function(dataset, i) {
                const meta = (chartInstance as any).controller.getDatasetMeta(i);
                meta.data.forEach(function(bar, index) {
                    const label = (dataset as any).tree[index].label;
                    const data = (dataset as any).tree[index].value;
                    const width = Math.ceil(ctx.measureText(label).width);
                    const finalLabel = width < Math.ceil((dataset['data'][index] as any).w) ? label : '';
                    const finalData = width < Math.ceil((dataset['data'][index] as any).w) ? data : '';
                    ctx.fillText(finalLabel, bar['_model']['x'], bar['_model']['y'] - (bar['_model']['height'] / 2));
                    ctx.fillText(finalData, bar['_model']['x'], bar['_model']['y'] - (bar['_model']['height'] / 2) + 20);
                });
            });
            }
        },
        // TODO asdf ei toimi?
        // active: {
        //   duration: 0
        // }
      },
      events: ['mousemove', 'mouseout', 'click'],
      onHover: (event, chartElement) => {
        event['target']['style']['cursor'] = chartElement[0] ? 'pointer' : 'default';
      }
      // hover: {
      //   // TODO asdf
      //   // animationDuration: 0,
      // }
    } as any;
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
    const tmpArray = [];
    (this.children || []).forEach((child, index) => {
      const id = child.id;
      const count = child.countOfFinnishSpecies;
      this.total += count;


      if (count > 0) {
        this.dataById[id] = child;
        tmpArray.push({value: count,
        label: (child.vernacularName) ?
        ( typeof child.vernacularName  === 'object' ?
        MultiLangService.getValue(child.vernacularName, this.translate.currentLang) : child.vernacularName)  : child.scientificName, id});
        this.lineChartLabels.push(child.vernacularName || child.scientificName);
        this.lineChartColors[0]['backgroundColor'].push(this.colorPalette[index % this.colorPalette.length]);
      }
    });

    tmpArray.sort((a, b) => (a.value > b.value) ? -1 : 1);
    this.lineChartData[0]['data'][0]['data'] = tmpArray;

  }

}
