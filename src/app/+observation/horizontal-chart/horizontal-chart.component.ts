import { map, switchMap } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,
OnInit, ChangeDetectorRef} from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { forkJoin as ObservableForkJoin, Observable, of, Subscription, timer, interval } from 'rxjs';
import { InformalTaxonGroupApi } from '../../shared/api/InformalTaxonGroupApi';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { BarChartComponent } from 'app/shared-modules/bar-chart/bar-chart/bar-chart.component';
import { Chart, ChartDataSets } from 'chart.js';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { TranslateService } from '@ngx-translate/core';
import {  HorizontalchartDataService } from './horizontal-chart-data.service';

@Component({
  selector: 'laji-horizontal-chart',
  templateUrl: './horizontal-chart.component.html',
  styleUrls: ['./horizontal-chart.component.scss'],
  providers: [InformalTaxonGroupApi, HorizontalchartDataService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalChartComponent implements OnInit, OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() height = 150;
  @Input() showLegend = false;
  @Input() legendPosition = 'top';
  @Input() visible = true;
  @Input() lang: string;

  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();


  loading = false;
  queryQL: Subscription;
  dataClasses: Subscription;
  taxa: string;
  componentHeight: number;
  loadLabels = false;
  barChartOptions: any = {
    legend: { display: false, labels: { fontColor: 'black' } }
  };
  subscription: Subscription;
  timer: Observable<any>;

 classification = [
   { data: 'phylumId', label: this.translate.instant('observation.label.phylum')},
   { data: 'classId', label: this.translate.instant('observation.label.class')},
   { data: 'orderId', label: this.translate.instant('observation.label.order')},
   { data: 'familyId', label: this.translate.instant('observation.label.family')},
   { data: 'genusId', label: this.translate.instant('observation.label.genus')}
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
              private translate: TranslateService,
              private horizontalDataService: HorizontalchartDataService
  ) {
  }

  ngOnInit() {
    Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
      return coordinates;
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['query']) {
      this.updateClasses();
    }
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
        map(res => res.results),
        switchMap(res => {
          const taxaIds = res.map(r => this.toQname.transform(r.aggregateBy['unit.linkings.taxon.' + this.classificationValue ]));
          return this.horizontalDataService.getChartDataLabels(taxaIds).pipe(
            map(labels => {
              return res.map((r, idx) => ({
                ...r,
                label: labels['r' + idx]
              }));
            })
          );
        }),
        map(res => {
          return res.map(r => {
            this.subDataBarChart.push(r.count);
            this.subBackgroundColors.push('#3498db');
            this.subLabelBarChart.push(r.label.vernacularName ? r.label.vernacularName : r.label.scientificName);
          });
        })
    )
    .subscribe(() => {
      this.allDataBarChart = this.subDataBarChart;
      this.allLabelBarChart = this.subLabelBarChart;
      this.allBackgroundColors = this.subBackgroundColors;

      this.subDataBarChart = this.subDataBarChart.slice(0, 10);
      this.subLabelBarChart = this.subLabelBarChart.slice(0, 10);
      this.subBackgroundColors = this.subBackgroundColors.slice(0, 10);

      this.barChartData[0].data = this.subDataBarChart;
      this.barChartData[0].backgroundColor = this.subBackgroundColors;
      this.barChartLabels = this.subLabelBarChart;

      this.initializeGraph();
      this.cd.markForCheck();
      this.loading = false;
    });

  }


  toggleShowAllData() {
    if (this.barChartData[0].data.length < this.allDataBarChart.length) {
      this.componentHeight = 500;
      this.barChartData[0].data = this.allDataBarChart;
      this.barChartLabels = this.allLabelBarChart;
      this.barChartData[0].backgroundColor = this.allBackgroundColors;
    } else {
      this.componentHeight = 300;
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
          display: true,
          ticks: {
            beginAtZero: true
          },
          gridLines: {
            color: 'rgba(255,255,255,0)',
            lineWidth: 0.5
          }
        }],
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: function(value) { if (value % 1 === 0) { return value; } }
            }
          }
        ]
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

    switch (true) {
      case (this.barChartData[0].data.length === 0):
      this.componentHeight = 100;
      break;
      case (this.barChartData[0].data.length === 1):
      this.componentHeight = 100;
      break;
      case (this.barChartData[0].data.length > 1 && this.barChartData[0].data.length <= 5):
      this.componentHeight = 200;
      break;
      case (this.barChartData[0].data.length > 5 && this.barChartData[0].data.length <= 10):
      this.componentHeight = 300;
      break;
      case (this.barChartData[0].data.length > 10 && this.barChartData[0].data.length <= 20):
      this.componentHeight = 400;
      break;
      case (this.barChartData[0].data.length > 20):
      this.componentHeight = 500;
      break;
    }
  }


}
