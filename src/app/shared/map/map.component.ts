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
  @Input() drawData:any;
  @Input() visible: boolean;
  @Input() draw:boolean = false;
  @Input() lang:string = 'fi';
  @Input() drawSingleShape:boolean = true;

  @Output() select = new EventEmitter();
  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
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
    this.map.map.on('moveend', _ => { this.moveEvent() });
    this.updateData();
    this.initDrawData();
    this.moveEvent();
  }

  moveEvent() {
    this.onMove.emit({
      zoom: this.map.map.getZoom(),
      bounds: this.map.map.getBounds()
    });
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
    } catch (e) { console.log(e) }
  }

  ngOnChanges(changes) {
    this.updateData();
    this.initDrawData();
  }

  updateData() {
    if (!this.map) {
      return;
    }
    try {
      this.map.map.off('click');
      this.map.setData(this.data);
      if (this.drawSingleShape) {
        this.initSingleShape();
      }
      if (this.visible) {
        setTimeout(() => {
          this.map.map.invalidateSize();
        }, 500);
      }
    } catch (e) { console.log(e) }
  }

  initSingleShape() {
    try {
      this.map.map.addEventListener({
        "draw:drawstart": event => this.clearDrawLayer()
      });
    } catch (e) { console.log(e) }
  }

  initDrawData() {
    if (this.map && this.drawData) {
      this.map.setDrawData(this.drawData);
    }
  }

  clearDrawLayer() {
    try {
      if (!this.drawData) {
        this.drawData = {featureCollection: {type: "featureCollection", features: []}};
      }
      this.drawData.featureCollection = {type: "featureCollection", features: []};
      this.map.setDrawData(this.drawData);
    } catch (e) { console.log(e) }
  }
}
