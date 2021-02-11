import { ChangeDetectorRef, Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { YkjService } from '../../../../../shared-modules/ykj/service/ykj.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-nafi-bumblebee-map',
  templateUrl: './nafi-bumblebee-map.component.html',
  styleUrls: ['./nafi-bumblebee-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeMapComponent {

  @Input() loading = true;
  @Input() showNameAsLink = true;
  @Input() countLabel = 'wbc.stats.routeCount';

  geoJsons: any[];
  _data: any;
  selectedGrid: string;

  breaks = [1, 2, 5, 10, 20];
  labels = ['1', '2-4', '5-9', '10-19', '20-'];
  colorRange = ['violet', 'blue', 'lime', 'yellow', 'orange'];

  @Output() rowSelect = new EventEmitter<string>();

  @Input() set data(data) {
    this.geoJsons = [];
    this._data = {};
    this.selectedGrid = undefined;

    data.map(item => {
      console.log(item)
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
        this.geoJsons.push({type: 'Feature', geometry: geometry, properties: {grid: grid, count: 1}});
      }
    });
    console.log(this.geoJsons)
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
