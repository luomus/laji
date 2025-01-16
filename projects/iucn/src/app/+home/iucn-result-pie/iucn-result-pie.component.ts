import { Component, Input } from '@angular/core';
import { ChartData } from 'chart.js';

interface DataType {
  labels: string[];
  datasets: {
      labels: string[];
      data: any[];
      backgroundColor: string[];
  }[];
}

interface ColorType {
  'MX.iucnRE': string;
  'MX.iucnCR': string;
  'MX.iucnEN': string;
  'MX.iucnVU': string;
  'MX.iucnDD': string;
  'MX.iucnNT': string;
  'MX.iucnLC': string;
}

@Component({
  selector: 'iucn-iucn-result-pie',
  templateUrl: './iucn-result-pie.component.html',
  styleUrls: ['./iucn-result-pie.component.css']
})
export class IucnResultPieComponent {

  @Input() year: any;
  _data?: ChartData;
  total = 0;
  _colors: ColorType = {
    'MX.iucnRE': '#000',
    'MX.iucnCR': '#600',
    'MX.iucnEN': '#f00',
    'MX.iucnVU': '#e65c00',
    'MX.iucnDD': '#bfbfbf',
    'MX.iucnNT': '#f2da30',
    'MX.iucnLC': '#8fcc00'
  };
  colorSchema = [];
  options = {responsive: true, maintainAspectRatio: false};

  @Input()
  set data(data: {name: string; value: number; key: string}[]) {
    if (!data) {
      return;
    }
    let cumulative = 0;
    this._data = data.reduce((_data: DataType, item) => {
      _data.labels.push(item.name);
      _data.datasets[0].labels.push(item.name);
      _data.datasets[0].data.push(item.value);
      _data.datasets[0].backgroundColor.push(this._colors[item.key as keyof ColorType]);
      cumulative += item.value;
      return _data;
    }, {labels: [], datasets: [{labels: [], data: [], backgroundColor: []}]});
    this.total = cumulative;
  }

  valueFormat(value: any) {
    return ('' + value).replace(/(\d)(?=(\d{3})+(\.\d*)?$)/g, '$1 ');
  }

}
