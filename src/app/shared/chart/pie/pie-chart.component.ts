import {Component, OnInit, Inject, ElementRef, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import { nvD3 } from "ng2-nvd3";

declare let d3:any;

@Component({
  selector: 'laji-pie-chart',
  template: '<nvd3 [options]="options" [data]="data"></nvd3>',
  directives: [nvD3]
})
export class PieChartComponent implements OnInit{
  @Input() data: {label:string, value:number}[];
  @Input() height: number = 400;
  @Output() sectionSelect = new EventEmitter();

  public options:any;

  constructor() {

  }

  ngOnInit() {
    this.refreshOptions();
  }

  public refreshOptions() {
    this.options = {
      chart: {
        callback: (chart) => {
          chart.pie.dispatch.on("elementClick", (e) => {
            //console.log('elem clicked');
            //console.log(e.data);
            this.sectionSelect.emit(e.data || {});
          });
        },
        type: 'pieChart',
        height: this.height,
        margin : {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        legendPosition: "right",
        valueFormat: function(d){
          return d3.format('.0f')(d);
        },
        x: function(d){return d.label;},
        y: function(d){return d.value;},
        showValues: true,
        showLabels: false,
        duration: 500,
      }
    };
  }

}
