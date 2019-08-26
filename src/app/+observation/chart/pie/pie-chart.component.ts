import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-pie-chart',
  template: `
  <div class="table-responsive">
  <ngx-charts-advanced-pie-chart
    [view]=""
    (select)="select($event)"
    [valueFormatting]="valueFormat"
    [scheme]="'fire'"
    [label]="'observation.results.observation' | translate"
    [results]="data"
    [gradient]="false">
    </ngx-charts-advanced-pie-chart>
    </div>
  `,
  styleUrls: ['./pie-chart.scss'],
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

  valueFormat(value) {
    return ('' + value).replace(/(\d)(?=(\d{3})+(\.\d*)?$)/g, '$1 ');
  }

}
