import { Component, OnInit, Input } from '@angular/core';
import { YkjService } from '../../../../../shared-modules/ykj/service/ykj.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-wbc-routes-map',
  templateUrl: './wbc-routes-map.component.html',
  styleUrls: ['./wbc-routes-map.component.scss']
})
export class WbcRoutesMapComponent implements OnInit {
  geoJsons: any[];
  _data: any;

  breaks = [1, 2, 5, 10, 20];
  labels = ['1', '2-4', '5-9', '10-19', '20-'];
  colorRange = ['violet', 'blue', 'lime', 'yellow', 'orange'];

  @Input() set data(data) {
    this.geoJsons = [];
    this._data = {};

    data.map(item => {
      const grid =  parseInt(item['document.namedPlace.ykj10km.lat'], 10) + ':'
      + parseInt(item['document.namedPlace.ykj10km.lon'], 10);
      const geometry = this.ykjService.convertYkjToGeoJsonFeature(
        item['document.namedPlace.ykj10km.lat'], item['document.namedPlace.ykj10km.lon']
      ).geometry;

      if (this._data[grid]) {
        this._data[grid].data.push(item);
        this.geoJsons[this._data[grid].idx].properties.count++;
      } else {
        this._data[grid] = {idx: this.geoJsons.length, data: [item]};
        this.geoJsons.push({type: 'Feature', geometry: geometry, properties: {grid: grid, count: 1}});
      }
    });
  };

  constructor(
    public translate: TranslateService,
    private ykjService: YkjService
  ) { }

  ngOnInit() {
  }

  gridClick(grid) {
    console.log(this._data[grid]);
  }
}
