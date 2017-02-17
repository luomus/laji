import { Component, OnInit } from '@angular/core';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core/src/translate.service';

@Component({
  selector: 'laji-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.css']
})
export class FrontComponent implements OnInit {

  drawData = {
    featureCollection: {
      type: 'FeatureCollection',
      features: []
    },
    getFeatureStyle: function () {
      return {color: '#000000', fillColor: '#000000', weight: 2};
    }
  };

  draw = {
    editable: true,
    marker: true,
    polygon: true,
    polyline: true,
    hasActive: true
  }

  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
  }

}
