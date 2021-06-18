import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IValidationStat } from '../../kerttu-global-shared/models';
import { Color } from 'ng2-charts';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-validation-pie-chart',
  templateUrl: './validation-pie-chart.component.html',
  styleUrls: ['./validation-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationPieChartComponent {
  labels: string[];
  colors: Color[] = [
    { backgroundColor: ['#e87d7d', '#f0e675', '#94e56c'] }
  ];

  _data = [];

  @Input() set data(data: IValidationStat[]) {
    if (!data) {
      this._data = null;
      return;
    }

    this._data = [0, 0, 0];
    data.forEach(d => {
      const index = d.validationCount >= 3 ? 2 : (d.validationCount >= 1 ? 1 : 0);
      this._data[index] += d.count;
    });
  }

  constructor(
    private traslate: TranslateService
  ) {
    this.labels = [
      this.traslate.instant('results.pie.group1'),
      this.traslate.instant('results.pie.group2'),
      this.traslate.instant('results.pie.group3')
    ]
  }
}
