/// <reference path="../../../../typings/globals/leaflet/index.d.ts" />

import {
  Component, ElementRef, OnDestroy, Input, Output, EventEmitter, OnChanges, ViewChild,
  OnInit
} from '@angular/core';

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
export class MapComponent implements OnDestroy, OnChanges, OnInit {

  @Input() data: any = {};
  @Input() drawData: any;
  @Input() visible: boolean;
  @Input() draw: any = false;
  @Input() lang: string = 'fi';
  @Input() drawSingleShape: boolean = true;
  @Input() initWithWorldMap: boolean = false;
  @Input() tick: any;
  @Input() bringDrawLayerToBack: boolean = true;

  @Output() select = new EventEmitter();
  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map: any;

  ngOnInit() {
    this.map = new lajiMap({
      tileLayerName: this.initWithWorldMap ? 'openStreetMap' : 'taustakartta',
      activeIdx: 0,
      zoom: this.initWithWorldMap ? 3 : 1,
      lang: this.lang,
      data: [],
      onChange: e => this.onChange(e),
      rootElem: this.elemRef.nativeElement,
      controlSettings: {
        draw: this.draw,
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
    this.updateData();
    this.initDrawData();
    this.moveEvent('moveend');
  }

  ngAfterViewInit() {
    this.updateData();
    this.initDrawData();
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
      this.map.map.off('click');
      this.map.destroy();
    } catch (err) {
      console.log(err);
    }
  }

  ngOnChanges(changes) {
    if (changes.visible) {
      setTimeout(() => {
        try {
          if (this.map) {
            this.map.map.invalidateSize();
          }
        } catch (e) {
        }
      }, 200);
    }
    if (changes.data || changes.drawData || changes.tick) {
      this.updateData();
      this.initDrawData();
    }
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
