/// <reference path="../../../../typings/globals/leaflet/index.d.ts" />

import { Component, ElementRef, OnDestroy, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';

const lajiMap = require('laji-map').default;

@Component({
  selector: 'laji-map',
  template: `
<div style="width:100%; height: 100%; position: relative">
  <div #map style="height:100%;width:100%"></div>
  <ng-content></ng-content>
</div>`,
  providers: []
})
export class MapComponent implements OnDestroy, OnChanges {

  @Input() data: any = {};
  @Input() drawData: any;
  @Input() visible: boolean;
  @Input() draw: boolean = false;
  @Input() lang: string = 'fi';
  @Input() drawSingleShape: boolean = true;
  @Input() tick: any;
  @Input() bringDrawLayerToBack: boolean = true;

  @Output() select = new EventEmitter();
  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map: any;

  ngAfterViewInit() {
    this.map = new lajiMap({
      activeIdx: 0,
      zoom: 1,
      lang: this.lang,
      data: [],
      onChange: e => this.onChange(e),
      rootElem: this.elemRef.nativeElement,
      controlSettings: {
        draw: this.draw,
        polygon: false,
        polyline: false,
        point: false,
        circle: false,
        marker: false,
        layers: true,
        zoom: true,
        location: false
      }
    });
    this.map.map.scrollWheelZoom.disable();
    this.map.map.on('moveend', _ => {
      this.moveEvent('moveend');
    });
    this.map.map.on('movestart', _ => {
      this.moveEvent('movestart');
    });
    this.map.map.on('focus', () => {
      this.map.map.scrollWheelZoom.enable();
    });
    this.map.map.on('blur', () => {
      this.map.map.scrollWheelZoom.disable();
    });
    this.updateData();
    this.initDrawData();
    this.moveEvent('moveend');
  }

  moveEvent(type: string) {
    this.onMove.emit({
      zoom: this.map.getNormalizedZoom(),
      bounds: this.map.map.getBounds(),
      type: type
    });
  }

  onChange(events) {
    events.map(event => {
      switch (event.type) {
        case 'create':
          this.onCreate.emit(event.feature.geometry);
          break;
        default:
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
          try {
            this.map.map.invalidateSize();
          } catch (e) {
          }
        }, 500);
      }
    } catch (err) {
      console.log(err);
    }
  }

  initSingleShape() {
    try {
      this.map.map.addEventListener({
        'draw:drawstart': event => this.clearDrawLayer()
      });
    } catch (e) {
      console.log(e);
    }
  }

  initDrawData() {
    if (this.map && this.drawData) {
      this.map.setDrawData(this.drawData);
      if (this.bringDrawLayerToBack) {
        this.map.drawLayerGroup.bringToBack();
      }
    }
  }

  clearDrawLayer() {
    try {
      if (!this.drawData) {
        this.drawData = {featureCollection: {type: 'featureCollection', features: []}};
      }
      this.drawData.featureCollection = {type: 'featureCollection', features: []};
      this.map.setDrawData(this.drawData);
    } catch (err) {
      console.log(err);
    }
  }
}
