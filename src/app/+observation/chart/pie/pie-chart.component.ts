import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'laji-pie-chart',
  template: `
  <ngx-charts-pie-chart
    [view]="[500, height]"
    (select)="select($event)"
    [legendTitle]="''"
    [results]="data"
    [labels]="false"
    [legend]="true"
    [labels]="true"
    [doughnut]="false"
    [gradient]="false">
    </ngx-charts-pie-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartComponent {
  @Input() data: {name: string, value: number}[];
  @Input() height = 100;
  @Input() showLegend = false;
  @Input() visible = false;
  @Input() legendPosition = 'top';

  @Output() sectionSelect = new EventEmitter();

  public options: any;

  select(event) {
    if (event && event.name && Array.isArray(this.data)) {
      const idx = this.data.findIndex((item) => item.name === event.name);
      if (idx > -1) {
        this.sectionSelect.emit(this.data[idx]);
      }
    }
  }

}
