import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';

declare let d3: any;

@Component({
  selector: 'laji-pie-chart',
  template: '<nvd3 [options]="options" [data]="data"></nvd3>'
})
export class PieChartComponent implements OnInit, OnChanges {
  @Input() data: {label: string, value: number}[];
  @Input() height: number = 100;
  @Input() showLegend: boolean = false;
  @Input() legendPosition: string = 'top';

  @Output() sectionSelect = new EventEmitter();

  public options: any;

  constructor() {
  }

  ngOnChanges() {
    this.refreshOptions();
  }

  ngOnInit() {
    this.refreshOptions();
  }

  public refreshOptions() {
    this.options = {
      chart: {
        callback: (chart) => {
          chart.pie.dispatch.on("elementClick", (e) => {
            this.sectionSelect.emit(e.data || {});
          });
        },
        type: 'pieChart',
        height: this.height,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        legendPosition: this.legendPosition,
        valueFormat: function (d) {
          return d3.format(',.0f')(d).replace(/,/g, ' ');
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showLegend: this.showLegend,
        showValues: true,
        showLabels: false,
        duration: 500,
      }
    };
  }

}
