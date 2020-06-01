import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-chart-treemap/dist/chartjs-chart-treemap.js';


@Component({
  selector: 'laji-species-pie',
  templateUrl: './species-pie.component.html',
  styleUrls: ['./species-pie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesPieComponent implements OnInit, OnChanges {
  @Input() children: Taxonomy[];
  data: any;
  labelFormatting = this.formatLabel.bind(this);
  valueFormatting = this.formatValue.bind(this);
  total = 0;

  lineChartData: any[] = [
      {
        data: [
          {
            type: 'treemap',
            key: 'data',
          data: [],
          fontFamily: 'Verdana',
        fontColor: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: function(ctx) {
          const item = ctx.dataset.data[ctx.dataIndex];
          if (!item) {
            return;
          }
          const a = item.v / (item.gs || item.s) / 2 + 0.5;
          return 'rgba(255,192,203," + a +")';
        },
        spacing: 2,
        borderWidth: 0.5,
        borderColor: 'rgba(160,160,160,0.5)'
        }
      ]
    }
  ];
  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio : false,
    legend: {
      display: false
    },
    tooltips: {
      callbacks: {
        title: function(item, data) {
          return data.datasets[item['datasetIndex']]['tree'][item['index']].label;
        },
        label: function(item, data) {
          return data.datasets[item['datasetIndex']]['tree'][item['index']].data;
        }
      }
    },
    plugins: {
      labels: {
        display: true,
        render: 'value',
        align: 'end',
        anchor: 'end'
      }
    }
  };
  lineChartLabels = [];
  lineChartPlugins = [pluginDataLabels];
  lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgb(70,130,180)',
      borderColor: 'rgb(70,130,180)',
      pointBackgroundColor: 'rgb(70,130,180)',
      pointBorderColor: 'rgb(70,130,180)',
      pointHoverBackgroundColor: 'rgb(70,130,180)',
      pointHoverBorderColor: 'rgb(70,130,180)'
    }
  ];
  dataById: {[key: string]: Taxonomy} = {};
  private speciesLabel = '';
  private speciesSingularLabel = '';

  @Output() taxonSelect = new EventEmitter<string>();

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.translate.get('taxonomy.species').subscribe(label => { this.speciesLabel = label; });
    this.translate.get('taxonomy.species.singular').subscribe(label => { this.speciesSingularLabel = label; });
    console.log(Chart.controllers);
    console.log(Chart.defaults.treemap);
  }

  ngOnChanges() {

    this.dataById = {};
    this.total = 0;
    this.lineChartData = [
      {
        data:
        {
          datasets: [
          {key: 'data',
          data: [],
          groups: ['label'],
          fontFamily: 'Verdana',
        fontColor: '#000',
        fontSize: 14,
        backgroundColor: function(ctx) {
          const item = ctx.dataset.data[ctx.dataIndex];
          if (!item) {
            return;
          }
          const a = item.v / (item.gs || item.s) / 2 + 0.5;
          return 'rgba(255,192,203," + a + ")';
        },
        spacing: 2,
        borderWidth: 0.5,
        borderColor: 'rgba(160,160,160,0.5)'
        }
        ]}
      }
    ];
    this.lineChartLabels = [];
    (this.children || []).forEach(child => {
      const id = child.id;
      const count = child.countOfFinnishSpecies;
      this.total += count;

      if (count > 0) {
        this.dataById[id] = child;
        this.lineChartData[0]['data']['datasets'][0].data.push({data: count, label: child.vernacularName || child.scientificName});
        this.lineChartLabels.push(child.vernacularName || child.scientificName);
      }
      this.lineChartData[0]['data']['datasets'][0].data.sort((a , b) => (a.data > b.data) ? -1 : ((b.data > a.data) ? 1 : 0));
    });
    console.log(this.lineChartData);
    this.cd.detectChanges();
  }

  private formatLabel(value: any) {
    const data = this.dataById[value.label];
    return data.vernacularName || data.scientificName;
  }

  private formatValue(value: number) {
    return value + ' ' + (value === 1 ? this.speciesSingularLabel : this.speciesLabel);
  }
}
