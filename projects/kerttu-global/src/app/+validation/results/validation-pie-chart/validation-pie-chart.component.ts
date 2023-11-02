import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { IValidationStat } from '../../../kerttu-global-shared/models';
import { Color } from 'ng2-charts';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bsg-validation-pie-chart',
  templateUrl: './validation-pie-chart.component.html',
  styleUrls: ['./validation-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationPieChartComponent {
  labels: string[] = ['', '', ''];
  colors: Color[] = [
    { backgroundColor: ['#e87d7d', '#f0e675', '#94e56c'] }
  ];

  _data = [];

  @Input() set data(data: IValidationStat[]) {
    if (!data) {
      this._data = [];
      return;
    }

    this._data = [0, 0, 0];
    data.forEach(d => {
      const index = d.validationCount >= 2 ? 2 : (d.validationCount >= 1 ? 1 : 0);
      this._data[index] += d.count;
    });
  }

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    const translationKeys = ['results.pie.group1', 'results.pie.group2', 'results.pie.group3'];
    this.translate.get(translationKeys).subscribe(translations => {
      this.labels = translationKeys.map(key => translations[key]);
      this.cd.markForCheck();
    });
  }
}
