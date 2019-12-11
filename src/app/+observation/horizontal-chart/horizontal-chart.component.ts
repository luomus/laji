import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,
OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { forkJoin as ObservableForkJoin, Observable, of, Subscription } from 'rxjs';
import { InformalTaxonGroupApi } from '../../shared/api/InformalTaxonGroupApi';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { BarChartComponent } from 'app/shared-modules/bar-chart/bar-chart/bar-chart.component';
import { Chart, ChartDataSets } from 'chart.js';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-horizontal-chart',
  templateUrl: './horizontal-chart.component.html',
  styleUrls: ['./horizontal-chart.component.scss'],
  providers: [InformalTaxonGroupApi],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() height = 150;
  @Input() showLegend = false;
  @Input() legendPosition = 'top';
  @Input() visible = true;
  @Input() lang: string;

  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();


  loading = false;
  dataClasses: Subscription;
  taxa: string;
  componentHeight: number;
  barChartOptions: any = {
    legend: { display: false, labels: { fontColor: 'black' } }
  };

 classification = [
   { data: 'phylumId', label: 'Phylum'},
   { data: 'classId', label: 'Class'},
   { data: 'orderId', label: 'Order'},
   { data: 'familyId', label: 'Family'},
   { data: 'speciesId', label: this.translate.instant('haseka.submissions.taxon')},
   { data: 'genusId', label: 'Genus'}
  ];

  classificationValue = 'classId';

  public barChartData: ChartDataSets[] = [
    { data: [], label: this.translate.instant('all') },
  ];
  public barChartLabels: string[] = [];

  subDataBarChart: number[] = [];
  subLabelBarChart: string[] = [];

  allDataBarChart: number[] = [];
  allLabelBarChart: string[] = [];
  subBackgroundColors: string[] = [];
  allBackgroundColors: string[] = [];

  constructor(private warehouseService: WarehouseApi,
              private cd: ChangeDetectorRef,
              private toQname: ToQNamePipe,
              private translate: TranslateService
  ) {
  }

  ngOnInit() {
    Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
      return coordinates;
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['query']) {
      this.cd.detectChanges();
      this.updateClasses();
    }
  }


  ngOnDestroy() {
    this.dataClasses.unsubscribe();
  }

  private updateClasses() {
    if (this.dataClasses) {
      this.dataClasses.unsubscribe();
    }

    this.barChartData = [];
    this.barChartLabels = [];
    this.allDataBarChart = [];
    this.allLabelBarChart = [];
    this.subDataBarChart = [];
    this.subLabelBarChart = [];
    this.subBackgroundColors = [];
    this.allBackgroundColors = [];

    this.barChartData = [{ data: [], backgroundColor: [], label: this.translate.instant('all') }];


    this.loading = true;
    this.dataClasses = this.warehouseService.warehouseQueryAggregateGet(
      this.query,
      ['unit.linkings.taxon.' + this.classificationValue ],
      undefined,
      30
    ).pipe(
      map(res => res.results)
    ).subscribe((res) => {
      res.map(r => {
        this.subDataBarChart.push(r.count);
        this.subLabelBarChart.push(this.toQname.transform(r.aggregateBy['unit.linkings.taxon.' + this.classificationValue ]));
        this.subBackgroundColors.push('#FFBB33');
      });

    this.initializeGraph();

    this.allDataBarChart = this.subDataBarChart;
    this.allLabelBarChart = this.subLabelBarChart;
    this.allBackgroundColors = this.subBackgroundColors;

    this.subDataBarChart = this.subDataBarChart.slice(0, 10);
    this.subLabelBarChart = this.subLabelBarChart.slice(0, 10);
    this.subBackgroundColors = this.subBackgroundColors.slice(0, 10);

    this.barChartData[0].data = this.subDataBarChart;
    this.barChartData[0].backgroundColor = this.subBackgroundColors;
    this.barChartLabels = this.subLabelBarChart;

    switch (true) {
      case (this.allDataBarChart.length <= 5):
      this.componentHeight = 200;
      break;
      case (this.allDataBarChart.length > 10 && this.allDataBarChart.length <= 20):
      this.componentHeight = 400;
      break;
      case (this.allDataBarChart.length > 20):
      this.componentHeight = 600;
      break;
   }
    this.cd.markForCheck();
    this.loading = false;
    });
  }

  toggleShowAllData() {
    this.initializeGraph();
    if (this.barChartData[0].data.length < this.allDataBarChart.length) {
      this.barChartData[0].data = this.allDataBarChart;
      this.barChartLabels = this.allLabelBarChart;
      this.barChartData[0].backgroundColor = this.allBackgroundColors;
    } else {
      this.barChartData[0].data = this.subDataBarChart;
      this.barChartLabels = this.subLabelBarChart;
      this.barChartData[0].backgroundColor = this.subBackgroundColors;
    }
  }

  changeClassification(event) {
    this.updateClasses();
  }

  initializeGraph() {
    this.barChartOptions = {
      legend: { display: false, labels: { fontColor: 'black' } },
      responsive: true,
      maintainAspectRatio: false,
      scaleShowValues: true,
      tooltips: {
      enabled: true,
      mode: 'index',
      position: 'cursor'
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          gridLines: {
            color: 'rgba(255,255,255,0)',
            lineWidth: 0.5
          }
        }]
      },
      plugins: {
        datalabels: {
          display: false
        },
      },
      animation: {
        duration: 700
      }
    };
  }

}
