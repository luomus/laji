import { ChangeDetectionStrategy, Component, EventEmitter,
Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { MultiLangService } from 'projects/laji/src/app/shared-modules/lang/service/multi-lang.service';

@Component({
  selector: 'laji-species-pie',
  templateUrl: './species-pie.component.html',
  styleUrls: ['./species-pie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesPieComponent implements OnInit, OnChanges {
  @Input() children: Taxonomy[];
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  total = 0;

  chartType: any = 'treemap';
  lineChartData: any;
  lineChartOptions: ChartOptions = {};
  lineChartLabels = [];
  colorPalette = ['#A8385D', '#7AA3E5', '#A27EA8', '#7ED3ED', '#50ABCC', '#AD6886', '#8796C0', '#ADCDED', '#ABD1F0', '#AAE3F5'];

  @Output() taxonSelect = new EventEmitter<string>();

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    Chart.register(TreemapController, TreemapElement);
    const pluralSpeciesLabel = this.translate.instant('taxonomy.species');
    const singularSpeciesLabel = this.translate.instant('taxonomy.species.singular');
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio : false,
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
      plugins: {
        tooltip: {
          intersect: false,
          bodyAlign: 'center',
          displayColors: false,
          callbacks: {
            title(item) {
              return item[0].dataset['tree'][item[0]['dataIndex']].label;
            },
            label(item) {
              const {count} = item.dataset['tree'][item['dataIndex']];
              const species = (count < 2) ? singularSpeciesLabel : pluralSpeciesLabel;
              return count + ' ' + species;
            }
          }
        }
      },
      events: ['mousemove', 'mouseout', 'click'],
      onHover: (event, chartElement) => {
        event.native['target']['style']['cursor'] = chartElement[0] ? 'pointer' : 'default';
      },
      hover: {
        animationDuration: 0,
      },
      animation: false
    } as any;
  }

  ngOnChanges() {
    this.total = 0;
    this.lineChartData = {
      datasets: [{
        tree: [],
        key: 'count',
        groups: [],
        backgroundColor: '#8D9DC6',
        labels: {
          display: true,
          color: 'black',
          formatter: (ctx: any) => {
            const {label, count} = ctx.raw._data;
            return [label, count];
          }
        }
      }]
    } as any;
    (this.lineChartData.datasets[0] as any).tree = (this.children || []).reduce((accData, child, index) => {
      const id = child.id;
      const count = child.countOfFinnishSpecies;
      this.total += count;

      if (count > 0) {
        const label = child.vernacularName
          ? (typeof child.vernacularName  === 'object'
            ? MultiLangService.getValue(child.vernacularName, this.translate.currentLang)
            : child.vernacularName)
          : child.scientificName;
        accData.push({
          id,
          count,
          label
        })
      }

      return accData;
    }, []).sort((a, b) => (a.count > b.count) ? -1 : 1);
  }

  onChartClick(e: any) {
    this.taxonSelect.emit((this.lineChartData.datasets[0] as any).tree[e.active[0].index].id);
  }
}
