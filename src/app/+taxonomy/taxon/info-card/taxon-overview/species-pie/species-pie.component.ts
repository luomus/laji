import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions } from 'chart.js';
import { Color} from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import * as OutLabel from 'chartjs-plugin-piechart-outlabels';


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

  lineChartData: any[];
  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio : false,
    cutoutPercentage: 50,
    legend: {
      display: false
    },
    plugins: {
        datalabels: {
          display: false
        },
        outlabels: {
          display: true,
          color: '#000',
          font: {
            resizable: true,
            size: '14'
          },
          stretch: 20,
          text: '%l %v'
        }
    },
    events: ['mousemove', 'click'],
    onHover: (event, chartElement) => {
        event.target['style'].cursor = chartElement[0] ? 'pointer' : 'default';
    }
  };
  lineChartLabels = [];
  lineChartPlugins = [pluginDataLabels, OutLabel];
  lineChartColors: Color[] = [
    {backgroundColor: ['#A8385D', '#7AA3E5', '#A27EA8', '#7ED3ED', '#50ABCC', '#AD6886', '#8796C0', '#ADCDED', '#ABD1F0', '#AAE3F5']}]
;
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
  }

  ngOnChanges() {

    this.dataById = {};
    this.total = 0;
    this.lineChartData = [{data: [], label: []}];
    this.lineChartLabels = [];
    (this.children || []).forEach(child => {
      const id = child.id;
      const count = child.countOfFinnishSpecies;
      this.total += count;

      if (count > 0) {
        this.dataById[id] = child;
        this.lineChartData[0].data.push(count);
        this.lineChartData[0].label.push(id);
        this.lineChartLabels.push(child.vernacularName || child.scientificName);
      }
    });

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
