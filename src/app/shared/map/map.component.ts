/// <reference path="../../../../typings/globals/leaflet/index.d.ts" />

import {
  Component, OnInit, ElementRef, Inject, OnDestroy, Input, Output, EventEmitter, OnChanges,
  ViewChild
} from '@angular/core';

let LajiMap = require('laji-map').default;

@Component({
  selector: 'laji-map',
  template: `
<div style="width:100%; height: 100%;">
  <div #map style="height:100%;width:100%"></div>
</div>`,
  providers: []
})
export class MapComponent implements OnDestroy, OnChanges {

  @Input() data: any = {};
  @Input() visible: boolean;
  @Input() draw:boolean = false;
  @Input() lang:string = 'fi';
  @Input() drawSingleShape:boolean = true;

  @Output() select = new EventEmitter();
  @Output() onCreate = new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map:any;

  ngAfterViewInit() {
    this.map = new LajiMap({
      activeIdx: 0,
      zoom: 1,
      lang: this.lang,
      data: [],
      onChange: e => this.onChange(e),
      rootElem: this.elemRef.nativeElement,
      controlSettings: {
        draw: this.draw,
        polygon: false,
        polyline:false,
        point:false,
        circle:false,
        marker: false,
        layers: true,
        zoom: true,
        location: false
      }
    });
    this.updateData();
  }

  onChange(events) {
    events.map(event => {
      switch (event.type) {
        case 'create':
          this.onCreate.emit(event.feature.geometry);
          break;
      }
    });
  }

  ngOnDestroy() {
    try {
      this.map.destroy();
    } catch (err) {
      console.log(err);
    }
  }

  ngOnChanges(changes) {
    this.updateData();
  }

  updateData() {
    if (!this.map) {
      return;
    }
      this.map.map.off('click');
      this.map.setData(this.data);
      if (this.drawSingleShape) {
        this.initSingleShape();
      }
      if (this.visible) {
        setTimeout(() => {
          try {
            this.map.map.invalidateSize();
          } catch (e) {}
        }, 500);
      }

  }

  initSingleShape() {
    try {
      this.map.map.addEventListener({
        "draw:drawstart": e => this.clearDrawLayer(e)
      });
    } catch (e) {
      console.log(e);
    }
  }

  clearDrawLayer(e) {
    try {
      this.map.setDrawData({featureCollection: {type: "featureCollection", features: []}});
    } catch (err) {
      console.log(err);
    }
  }
}
