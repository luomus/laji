import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-iucn-result-pie',
  templateUrl: './iucn-result-pie.component.html',
  styleUrls: ['./iucn-result-pie.component.css']
})
export class IucnResultPieComponent implements OnInit {

  @Input() year;
  _data: {name: string, value: number}[];
  total = 0;
  _colors = {
    'MX.iucnRE': '#000',
    'MX.iucnCR': '#600',
    'MX.iucnEN': '#f00',
    'MX.iucnVU': '#e65c00',
    'MX.iucnDD': '#bfbfbf',
    'MX.iucnNT': '#f2da30',
    'MX.iucnLC': '#8fcc00'
  };
  colorSchema = [];

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set data(data: {name: string, value: number, key: string}[]) {
    if (!data) {
      return;
    }
    this._data = data;
    const colors = [];
    let cumulative = 0;
    data.forEach(row => {
      cumulative += row.value;
      colors.push({name: row.name, value: this._colors[row.key]});
    });
    this.total = cumulative;
    this.colorSchema = colors;
  }

  valueFormat(value) {
    return ('' + value).replace(/(\d)(?=(\d{3})+(\.\d*)?$)/g, '$1 ');
  }

}
