import { Component, EventEmitter, Input, OnChanges, OnInit, Output, OnDestroy } from '@angular/core';
import { ViewChild } from '@angular/core';
import { nvD3 } from '../../../ng2-nvd3/ng2-nvd3.component';

@Component({
  selector: 'laji-pie-chart',
  template: '<nvd3 *ngIf="innerVisibility" [options]="options" [data]="data"></nvd3>'
})
export class PieChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(nvD3)
  public nvD3: nvD3;
  @Input() data: {label: string, value: number}[];
  @Input() height = 100;
  @Input() showLegend = false;
  @Input() visible = false;
  @Input() legendPosition = 'top';

  @Output() sectionSelect = new EventEmitter();

  public innerVisibility = true;
  public options: any;

  constructor() {
  }

  ngOnInit() {
    this.refreshOptions();
  }

  ngOnChanges(changes) {
    if (changes.visible) {
      setTimeout(() => {
        this.innerVisibility = changes.visible.currentValue;
      }, 100);
    } else {
      this.refreshOptions();
    }
  }

  ngOnDestroy() {
    this.nvD3.clearElement();
  }

  public refreshOptions() {
    this.options = {
      chart: {
        callback: (chart) => {
          chart.pie.dispatch.on('elementClick', (e) => {
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
