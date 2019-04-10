import { Component, Input, OnInit } from '@angular/core';

export interface FillArea {
 'ML.270'?: string;
 'ML.271'?: string;
 'ML.268'?: string;
 'ML.269'?: string;
 'ML.266'?: string;
 'ML.267'?: string;
 'ML.265'?: string;
 'ML.264'?: string;
 'ML.263'?: string;
 'ML.259'?: string;
 'ML.260'?: string;
 'ML.261'?: string;
 'ML.262'?: string;
 'ML.255'?: string;
 'ML.256'?: string;
 'ML.257'?: string;
 'ML.258'?: string;
 'ML.251'?: string;
 'ML.252'?: string;
 'ML.253'?: string;
 'ML.254'?: string;
}

@Component({
  selector: 'laji-biogeographical-province',
  templateUrl: './biogeographical-province.component.html',
  styles: []
})
export class BiogeographicalProvinceComponent implements OnInit {

  @Input() fill: FillArea = {};

  borderColor = '#333';

  constructor() { }

  ngOnInit() {
  }

}
