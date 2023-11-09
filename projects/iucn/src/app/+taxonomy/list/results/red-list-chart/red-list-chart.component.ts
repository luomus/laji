import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import type { ActiveElement, ChartData, ChartEvent, ChartOptions } from 'chart.js';

export interface IUCNChartData {
  'id'?: string;
  'name': string;
  'series': {name: string; value: number}[];
}

export interface IUCNSimpleChartData {
  'id': string;
  'name': string;
  'value': number;
}

@Component({
  selector: 'iucn-red-list-chart',
  templateUrl: './red-list-chart.component.html',
  styleUrls: ['./red-list-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListChartComponent {

  _data: ChartData;

  @Input() primaryColor = '#d62022';
  @Input() secondaryColor = '#888';

  @Input()
  legend = true;

  @Output() valueSelect = new EventEmitter<string>();

  private ids: string[];

  options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    onClick: this.itemSelect.bind(this),
    scales: {
      x: {
        title: {
          display: true,
          text: this.translate.instant('taxonomy.species')
        }
      }

    }
  };

  constructor(private translate: TranslateService) { }

  @Input()
  set data(data: IUCNChartData[]) {
    if (!data) {
      this._data = undefined;
      return;
    }
    const datasets = [
      {
        label: data[0].series[0].name,
        data: data.map(item => item.series[0].value),
        backgroundColor: this.primaryColor
      },
      {
        label: data[0].series[1].name,
        data: data.map(item => item.series[0].value),
        backgroundColor: this.secondaryColor
      }
    ];
    const labels = data.map(({name}) => name);
    this._data =  {datasets, labels};
    this.ids = data.map(({id}) => id);
  }

  itemSelect(event: ChartEvent, elements: ActiveElement[]) {
    if (!elements[0]) {
      return;
    }
    this.valueSelect.emit(this.ids[elements[0].index]);
  }
}
