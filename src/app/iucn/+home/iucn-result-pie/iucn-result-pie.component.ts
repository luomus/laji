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
  colorSchema = [
    {
      name: 're',
      value: '#000'
    }, {
      name: 'cr',
      value: '#d81e05'
    }, {
      name: 'en',
      value: '#fc7f3f'
    }, {
      name: 'vu',
      value: '#f9e814'
    }, {
      name: 'nt',
      value: '#cce226'
    }, {
      name: 'lc',
      value: '#60c659'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set data(data: {name: string, value: number}[]) {
    this._data = data;
    this.total = data.reduce((cumulative, current) => cumulative + current.value, 0);
  }

  valueFormat(value) {
    return ('' + value).replace(/(\d)(?=(\d{3})+(\.\d*)?$)/g, '$1 ');
  }

}
