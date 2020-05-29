import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
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

  lineChartData: any[] = [{data: [], key: 'data'}];
  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio : false,
    legend: {
      display: false
    },
    plugins: {
      datalabels: {
        display: true
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
    private translate: TranslateService
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
    this.data = (this.children || []).reduce((arr: any[], child) => {
      const id = child.id;
      const count = child.countOfFinnishSpecies;
      this.total += count;

      if (count > 0) {
        this.dataById[id] = child;
        arr.push({name: id, value: count});
        this.lineChartData[0].data.push({data: count, label: id});
        this.lineChartLabels.push(id);
      }


      console.log(this.lineChartData);
      console.log(arr);

      return arr;
    }, []);
  }

  private formatLabel(value: any) {
    const data = this.dataById[value.label];
    return data.vernacularName || data.scientificName;
  }

  private formatValue(value: number) {
    return value + ' ' + (value === 1 ? this.speciesSingularLabel : this.speciesLabel);
  }
}
