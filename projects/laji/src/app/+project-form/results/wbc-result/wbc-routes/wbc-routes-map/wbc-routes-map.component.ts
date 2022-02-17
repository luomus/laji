import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { YkjService } from '../../../../../shared-modules/ykj/service/ykj.service';
import { TranslateService } from '@ngx-translate/core';
import { TileLayerName } from 'laji-map';

@Component({
  selector: 'laji-wbc-routes-map',
  templateUrl: './wbc-routes-map.component.html',
  styleUrls: ['./wbc-routes-map.component.scss']
})
export class WbcRoutesMapComponent {
  @Input() loading = true;
  @Input() showNameAsLink = true;
  @Input() countLabel = 'wbc.stats.routeCount';

  geoJsons: any[];
  _data: any;
  selectedGrid: string;

  breaks = [1, 2, 5, 10, 20];
  labels = ['1', '2-4', '5-9', '10-19', '20-'];
  colorRange = ['violet', 'blue', 'lime', 'yellow', 'orange'];
  layers = TileLayerName;

  @Output() rowSelect = new EventEmitter<string>();

  @Input() set data(data) {
    this.geoJsons = [];
    this._data = {};
    this.selectedGrid = undefined;

    data.map(item => {
      if (!item['document.namedPlace.ykj10km.lat'] || !item['document.namedPlace.ykj10km.lon']) {
        return;
      }
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
        this.geoJsons.push({type: 'Feature', geometry, properties: {grid, count: 1}});
      }
    });
  }

  constructor(
    public translate: TranslateService,
    private ykjService: YkjService,
    private cdr: ChangeDetectorRef
  ) { }

  gridClick(grid) {
    this.selectedGrid = grid;
    this.cdr.detectChanges();
  }
}
