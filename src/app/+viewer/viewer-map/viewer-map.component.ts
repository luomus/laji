import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'laji-viewer-map',
  templateUrl: './viewer-map.component.html',
  styleUrls: ['./viewer-map.component.css']
})
export class ViewerMapComponent implements OnInit, OnChanges {

  @Input() data: any;
  @Input() height = 300;

  public _data: any;

  constructor() { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges() {
    this.initData();
  }

  private initData() {
    if (!this.data) {
      return;
    }
    try {
      this._data = this.data.map(set => ({
        featureCollection: {
          type: set.type,
          features: set.features.map(feat => ({
            type: feat.type,
            geometry: feat.geometry,
            properties: {}
          }))
        }
      }));
    } catch (e) { console.log(e); }
  }

}
