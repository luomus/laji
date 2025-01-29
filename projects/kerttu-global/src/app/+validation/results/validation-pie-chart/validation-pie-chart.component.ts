import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { IValidationStat } from '../../../kerttu-global-shared/models';
import { TranslateService } from '@ngx-translate/core';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'bsg-validation-pie-chart',
  templateUrl: './validation-pie-chart.component.html',
  styleUrls: ['./validation-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationPieChartComponent {
  options: ChartOptions = {
    aspectRatio: 2
  };

  _data: ChartData = {
    labels: ['', '', ''],
    datasets: [{
      data: [],
      backgroundColor: ['#e87d7d', '#f0e675', '#94e56c']
    }]
  };

  @Input() set data(data: IValidationStat[]|undefined) {
    this._data = { ...this._data };

    if (!data) {
      this._data.datasets[0].data = [];
      return;
    }

    this._data.datasets[0].data = [0, 0, 0];
    data.forEach(d => {
      const index = d.validationCount >= 2 ? 2 : (d.validationCount >= 1 ? 1 : 0);
      (this._data.datasets[0].data[index] as number) += d.count;
    });
  }

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    const translationKeys = ['results.pie.group1', 'results.pie.group2', 'results.pie.group3'];
    this.translate.get(translationKeys).subscribe(translations => {
      this._data.labels = translationKeys.map(key => translations[key]);
      this.cd.markForCheck();
    });
  }
}
